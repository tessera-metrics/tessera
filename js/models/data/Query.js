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
  self.perf = ds.perf('ds.models.data.Query', self.name)
  self.cache = {}

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
    var url = new URI(options.base_url || ds.config.GRAPHITE_URL);
    url = url.segment('render')
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
   * Encode string to base64
   * @param {string} input
   * @returns {string}
   */
  function btoa(input) {
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    function _utf8_encode(string) {
      string = string.replace(/\r\n/g, "\n");
      var utftext = "";

      for (var n = 0; n < string.length; n++) {

        var c = string.charCodeAt(n);

        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }

      return utftext;
    }

    var output = "",
        chr1, chr2, chr3, enc1, enc2, enc3, enc4,
        i = 0;

    input = _utf8_encode(input);

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

        output = output + _keyStr.charAt(enc1) +_keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);

      }

    return output;
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
      self.cache = {}
      self.perf.start('load')
      options.format = 'json'
      var url = self.url(options)
      ds.event.fire(self, 'ds-data-loading')
      return $.ajax({
        dataType: 'jsonp',
        url: url,
        jsonp: 'jsonp',
        beforeSend: function(xhr) {
          if (ds.config.GRAPHITE_AUTH !== '') {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(ds.config.GRAPHITE_AUTH))
          }
        }
      })
       .fail(function(xhr, status, error) {
        self.perf.end('load')
        ds.manager.error('Failed to load query ' + self.name + '. ' + error)
      })
       .then(function(response_data, textStatus) {
        self.perf.end('load')
        _summarize(response_data)
        if (options.ready && (options.ready instanceof Function)) {
          options.ready(self)
        }
        ds.event.fire(self, 'ds-data-ready', self)
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
  function _summarize(response_data) {
    self.perf.start('summarize')
    self.summation = ds.models.data.Summation(response_data)
    self.data = response_data.map(function(series) {
                  series.summation = ds.models.data.Summation(series).toJSON()
                  return series
                })
    self.perf.end('summarize')
    return self
  }

  /**
   * Fetch data processed for use by a particular chart renderer, and
   * cache it in the query object so it's not re-processed over and
   * over.
   */
  self.chart_data = function(type) {
    var cache_key = 'chart_data_' + type
    if (!self.cache[cache_key]){
      self.perf.start('convert')
      self.cache[cache_key] = ds.charts.process_data(self.data, type)
      self.perf.end('convert')
    }
    return self.cache[cache_key]
  }

  self.performance_data = function() {
    return {
      load:      self.perf.get_last_measure('load'),
      summarize: self.perf.get_last_measure('summarize'),
      convert:   self.perf.get_last_measure('convert')
    }
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
