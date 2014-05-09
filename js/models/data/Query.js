ds.models.data.Query = function(data_) {
  "use strict";

  var targets = []
    , name
    , data
    , summation
    , options
    , self = {};

  if (data_) {
    if (data_.targets) {
      if (data_.targets instanceof Array) {
        targets = data_.targets;
      } else {
        targets = [data_.targets];
      }
    }
    name = data_.name;
  }

  self.DEFAULT_FROM_TIME = '-3h';

  Object.defineProperty(self, 'targets', {get: function() { return targets; }});
  Object.defineProperty(self, 'name', {get: function() { return name; }});
  Object.defineProperty(self, 'data', {get: function() { return data; }});
  Object.defineProperty(self, 'summation', {get: function() { return summation; }});
  Object.defineProperty(self, 'options', {get: function() { return options; }});
  Object.defineProperty(self, 'is_query', {value: true});

  self.render_templates = function(context) {
    targets = targets.map(function(t) {
                return ds.render_template(t, context);
              });
  }

  self.url = function(_) {
    options = options || _ || {}
    var url = URI(options.base_url)
              .path('/render')
              .setQuery('format', options.format || 'png')
              .setQuery('from', options.from || self.DEFAULT_FROM_TIME);
    if (options.until) {
      url.setQuery('until', options.until);
    }
    for (var i in targets) {
      url.addQuery('target', targets[i]);
    }
    return url.href();
  }

  /**
   * Asynchronously load the data for this query from the graphite
   * server, notifying any listening consumers when the data is
   * available.
   *
   * @param {Object} options Parameters for generating the URL to
   * load. Valid properties are:
   *   * base_url (required)
   *   * from
   *   * until
   *   * ready
   *   * fire_only
   */
  self.load = function(options_) {
    options = options || options_ || {}
    console.log("Query.load")
    // Ugh this default overriding is geting ugly. I need an options
    // merge() function
    if ((options_ && options_.fire_only) || options.fire_only) {
      console.log("Query.load fire_only");
      // This is a bit of a hack for optimization, to fire the query
      // events when if we don't need the raw data because we're
      // rendering non-interactive graphs only. Would like a more
      // elegant way to handle the case.
      var ready = options.ready
      if (options_ && options_.ready) {
        ready = options_.ready
      }
      if (ready && (ready instanceof Function)) {
        ready(self);
      }
      bean.fire(self, 'ds-data-ready', self);
    } else {
    console.log("Query.load ajaxing")
      options.format = 'json';
      var url = self.url(options);
      bean.fire(self, 'ds-data-loading');
      $.ajax({
        dataType: 'json',
        url: url
      })
       .done(function(response_data, textStatus) {
        self._process(response_data);
        if (options.ready && (options.ready instanceof Function)) {
          options.ready(self);
        }
        bean.fire(self, 'ds-data-ready', self);
      })
       .error(function(xhr, status, error) {
        ds.manager.error('Failed to load query ' + self.name + '. ' + error);
      });
    }
  }

  /**
   * Register an event handler to be called when the query's data is
   * loaded.
   */
  self.on_load = function(handler) {
    bean.on(self, 'ds-data-ready', handler);
  }

  /**
   * Process the results of executing the query, transforming
   * the returned structure into something consumable by the
   * charting library, and calculating sums.
   */
  self._process = function(response_data) {
    summation = ds.models.data.Summation();
    data = response_data.map(function(series) {
             series.summation = ds.models.data.Summation(series).toJSON();
             series.key = series.target;
             series.values = series.datapoints;
             summation.merge(series.summation);
             delete series.target;
             delete series.datapoints;
             return series;
           });
    return self;
  }

  /**
   * Data mutators
   */

  self.set_targets = function(_) {
    targets = _;
    return self;
  }

  self.set_name = function(_) {
    name = _;
    return self;
  }

  self.toJSON = function() {
    var json = {}
    if (name)
      json.name = name
    if (targets)
      json.targets = targets
    if (data)
      json.data = data
    if (summation)
      json.summation = summation.toJSON()
    return json
  }

  return self;
}
