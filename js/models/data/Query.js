ds.models.data.Query = function(data_) {
  "use strict";

  var self = limivorous.observable()
                       .property('targets')
                       .property('name')
                       .property('data')
                       .property('summation')
                       .property('options')
                       .build()

  if (data_) {
    if (data_.targets) {
      if (data_.targets instanceof Array) {
        self.targets = data_.targets;
      } else {
        self.targets = [data_.targets];
      }
    }
    self.name = data_.name;
  }

  self.DEFAULT_FROM_TIME = '-3h';

  Object.defineProperty(self, 'is_query', {value: true});

  self.render_templates = function(context) {
    self.targets = self.targets.map(function(t) {
                     return ds.render_template(t, context);
                   });
  }

  self.url = function(_) {
    self.options = self.options || _ || {}
    var url = URI(self.options.base_url)
              .path('/render')
              .setQuery('format', self.options.format || 'png')
              .setQuery('from', self.options.from || self.DEFAULT_FROM_TIME);
    if (self.options.until) {
      url.setQuery('until', self.options.until);
    }
    for (var i in self.targets) {
      url.addQuery('target', self.targets[i]);
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
    self.options = self.options || options_ || {}
    // Ugh this default overriding is geting ugly. I need an options
    // merge() function
    if ((options_ && options_.fire_only) || self.options.fire_only) {
      // This is a bit of a hack for optimization, to fire the query
      // events when if we don't need the raw data because we're
      // rendering non-interactive graphs only. Would like a more
      // elegant way to handle the case.
      var ready = self.options.ready
      if (options_ && options_.ready) {
        ready = options_.ready
      }
      if (ready && (ready instanceof Function)) {
        ready(self);
      }
      bean.fire(self, 'ds-data-ready', self);
    } else {
      self.options.format = 'json';
      var url = self.url(self.options);
      bean.fire(self, 'ds-data-loading');
      $.ajax({
        dataType: 'json',
        url: url
      })
       .done(function(response_data, textStatus) {
        self._process(response_data);
        if (self.options.ready && (self.options.ready instanceof Function)) {
          self.options.ready(self);
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
    self.summation = ds.models.data.Summation();
    self.data = response_data.map(function(series) {
                  series.summation = ds.models.data.Summation(series).toJSON();
                  self.summation.merge(series.summation);
                  // TODO: should have canonical format in query
                  // object and process on-demand (cached in
                  // non-serializing attribute)
                  return ds.charts.process_series(series);
                });
    return self;
  }

  self.toJSON = function() {
    var json = {}
    if (self.name)
      json.name = self.name
    if (self.targets)
      json.targets = self.targets
    if (self.data)
      json.data = self.data
    if (self.summation)
      json.summation = self.summation.toJSON()
    if (self.options)
      json.options = self.options
    return json
  }

  return self;
}
