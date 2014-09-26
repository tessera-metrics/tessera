ds.models.data.Query = function(data) {
  "use strict"

  var self = limivorous.observable()
                       .property('targets')
                       .property('name')
                       .property('data')
                       .property('summation')
                       .property('options')
                       .property('expanded_targets')
                       .property('local_options')
                       .build()
    , log = ds.log.logger('tessera.query')

  if (data) {
    if (data instanceof Array) {
      self.targets = data
    } else if (typeof(data) === 'string') {
      self.targets = [data]
    } else if (data.targets) {
      if (data.targets instanceof Array) {
        self.targets = data.targets
      } else {
        self.targets = [data.targets]
      }
    }
    if (data.options) {
      self.options = data.options
    }
    self.name = data.name
  }

  self.DEFAULT_FROM_TIME = '-3h'

  Object.defineProperty(self, 'is_query', {value: true})

  self.render_templates = function(context) {
    self.expanded_targets = self.targets.map(function(t) {
                              try {
                                return ds.render_template(t, context)
                              } catch ( e ) {
                                ds.manager.error('Failed to expand query ' + self.name + ': ' + e)
                                return t
                              }
                            })
  }

  self.url = function(opt) {
    var options = ds.extend(self.local_options, opt, self.options)
    var uri = URI(options.base_url || ds.config.GRAPHITE_URL)
    var path = uri.path() + (/\/$/.test(uri.path()) ? 'render' : '/render')
    var url = uri.path(path)
              .path('/render')
              .setQuery('format', options.format || 'png')
              .setQuery('from', options.from || ds.config.DEFAULT_FROM_TIME || self.DEFAULT_FROM_TIME)
              .setQuery('tz', ds.config.DISPLAY_TIMEZONE)
    if (options.until) {
      url.setQuery('until', options.until)
    }
    var targets = self.expanded_targets || self.targets
    for (var i = 0; i < targets.length; i++) {
      url.addQuery('target', targets[i].replace(/(\r\n|\n|\r)/gm,""))
    }
    return url.href()
  }

  /**
   * Return true if the item's query has the graphite stacked()
   * function anywhere in it. If you have stacked() in the query and
   * areaMode=stack in the URL, bad shit will happen to your graph.
   */
  self.is_stacked = function() {
    var targets = self.expanded_targets || self.targets
    if (typeof(targets) === 'undefined')
      return false
    var stacked = false
    self.targets.forEach(function(target) {
      if (target.indexOf('stacked') > -1) {
        stacked = true
      }
    })
    return stacked
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
   * @param {boolean} fire_only Just raise the event, without fetching
   *                            data.
   */
  self.load = function(opt, fire_only) {
    log.debug('load(): ' + self.name)
    self.local_options = ds.extend(self.local_options, opt)
    var options = ds.extend(self.local_options, opt, self.options)

    if (typeof(fire_only) === 'boolean' && fire_only) {
      // This is a bit of a hack for optimization, to fire the query
      // events when if we don't need the raw data because we're
      // rendering non-interactive graphs only. Would like a more
      // elegant way to handle the case.
      var ready = options.ready
      if (ready && (ready instanceof Function)) {
        ready(self)
      }

      ds.event.fire(self, 'ds-data-ready', self)
    } else {
      options.format = 'json'
      var url = self.url(options)
      ds.event.fire(self, 'ds-data-loading')
      $.ajax({
        dataType: 'json',
        url: url
      })
       .done(function(response_data, textStatus) {
        self._process(response_data)
        if (options.ready && (options.ready instanceof Function)) {
          options.ready(self)
        }
        ds.event.fire(self, 'ds-data-ready', self)
      })
       .error(function(xhr, status, error) {
        ds.manager.error('Failed to load query ' + self.name + '. ' + error)
      })
    }
  }

  /**
   * Register an event handler to be called when the query's data is
   * loaded.
   */
  self.on_load = function(handler) {
    log.debug('on(): ' + self.name)
    ds.event.on(self, 'ds-data-ready', handler)
  }

  /**
   * Remove all registered event handlers.
   */
  self.off = function() {
    log.debug('off(): ' + self.name)
    ds.event.off(self, 'ds-data-ready')
  }

  function group_targets(query) {
    return (query.targets.length > 1)
         ? 'group(' + query.targets.join(',') + ')'
         : query.targets[0]
  }

  /**
   * Return a new query with the targets timeshifted.
   */
  self.shift = function(interval) {
    var group = group_targets(self)
    return ds.models.data.Query({
      name: self.name + '_shift_' + interval,
      targets: [
        'timeShift(' + group + ', \"' + interval + '\")'
      ]
    })
  }

  /**
   * Return a new query with the targets from this query and another
   * query joined into a 2-target array, for comparison presentations.
   */
  self.join = function(other) {
    var target_self  = group_targets(self)
    var target_other = group_targets(other)
    return ds.models.data.Query({
      name: self.name + '_join_' + other.name,
      targets: [
        target_self,
        target_other
      ]
    })
  }

  /**
   * Process the results of executing the query, transforming
   * the returned structure into something consumable by the
   * charting library, and calculating sums.
   */
  self._process = function(response_data) {
    self.summation = ds.models.data.Summation(response_data)
    self.data = response_data.map(function(series) {
                  series.summation = ds.models.data.Summation(series).toJSON()
                  return series
                })
    return self
  }

  /**
   * Fetch data processed for use by a particular chart renderer, and
   * cache it in the query object so it's not re-processed over and
   * over.
   */
  self.chart_data = function(type) {
    var attribute = 'chart_data_' + type
    if (typeof(self[attribute]) === 'undefined') {
      self[attribute] = ds.charts.process_data(self.data, type)
    }
    return self[attribute]
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

  return self
}
