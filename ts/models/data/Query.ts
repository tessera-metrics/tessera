module ts {
  export module models {
    export module data {

      let log = ts.log.logger('tessera.query')

      /**
       * TODO: move this to a separate (external) module.
       *
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

      export interface QueryDictionary {
        [index: string] : Query
      }

      export class Query extends Model {
        static DEFAULT_FROM_TIME = '-3h'

        targets: string[]
        name: string
        data: any
        summation: Summation
        options: any
        expanded_targets: string[]
        local_options: any

        private perf: any
        private load_count: number = 0
        private cache: Map<string, any> = new Map<string, any>()

        constructor(data: any) {
          super(data)
          if (data) {
            if (data instanceof Array) {
              this.targets = data
            } else if (typeof(data) === 'string') {
              this.targets = [data]
            } else if (data.targets) {
              if (data.targets instanceof Array) {
                this.targets = data.targets
              } else {
                this.targets = [data.targets]
              }
            }
            if (data.options) {
              this.options = data.options
            }
            this.name = data.name
          }
          this.perf = ts.perf('ts.models.data.Query', this.name)
        }

        set_name(name: string) : Query {
          this.name = name
          return this
        }

        set_options(options: any) : Query {
          this.options = options
          return this
        }

        render_templates(context: any) : void {
          this.expanded_targets = this.targets.map(t => {
            try {
              return ts.render_template(t, context)
            } catch ( e ) {
              ts.manager.error(`Failed to expand query ${this.name}: ${e}`)
              return t
            }
          })
        }

        url(opt: any) : string {
          var options = $.extend({}, this.local_options, opt, this.options)
          var url     = new URI(options.base_url || ds.config.GRAPHITE_URL)
            .segment('render')
            .setQuery('format', options.format || 'png')
            .setQuery('from', options.from || ds.config.DEFAULT_FROM_TIME || Query.DEFAULT_FROM_TIME)
            .setQuery('tz', ds.config.DISPLAY_TIMEZONE)
          if (options.until) {
            url.setQuery('until', options.until)
          }
          var targets = this.expanded_targets || this.targets
          for (let t of targets) {
            url.addQuery('target', t.replace(/(\r\n|\n|\r)/gm,''))
          }
          return url.href()
        }

        /**
         * Return true if the item's query has the graphite stacked()
         * function anywhere in it. If you have stacked() in the query and
         * areaMode=stack in the URL, bad shit will happen to your graph.
         */
        is_stacked() : boolean {
          var targets = this.expanded_targets || this.targets
          if (typeof(targets) === 'undefined')
            return false
          var stacked = false
          this.targets.forEach(function(target) {
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
        load(opt?: any, fire_only?: boolean) : void {
          log.debug('load(): ' + this.name)
          this.local_options = $.extend({}, this.local_options, opt)
          var options = $.extend({}, this.local_options, opt, this.options)

          if (typeof(fire_only) === 'boolean' && fire_only) {
            // This is a bit of a hack for optimization, to fire the query
            // events when if we don't need the raw data because we're
            // rendering non-interactive graphs only. Would like a more
            // elegant way to handle the case.
            var ready = options.ready
            if (ready && (ready instanceof Function)) {
              ready(this)
            }

            ts.event.fire(this, 'ds-data-ready', this)
          } else {
            this.cache.clear()
            this.perf.start('load')
            options.format = 'json'
            var url = this.url(options)
            ts.event.fire(this, 'ds-data-loading')
            this.load_count += 1
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
              .fail((xhr, status, error) => {
                this.perf.end('load')
                ts.manager.error('Failed to load query ' + this.name + '. ' + error)
              })
              .then((response_data, textStatus) => {
                this.perf.end('load')
                this._summarize(response_data)
                if (options.ready && (options.ready instanceof Function)) {
                  options.ready(this)
                }
                ts.event.fire(this, 'ds-data-ready', this)
              })
          }
        }

        /**
         * Register an event handler to be called when the query's data is
         * loaded.
         */
        on_load(handler: any) : void {
          log.debug('on(): ' + this.name)
          ts.event.on(this, 'ds-data-ready', handler)
        }

        /**
         * Remove all registered event handlers.
         */
        off() : void {
          log.debug('off(): ' + this.name)
          ts.event.off(this, 'ds-data-ready')
        }

        _group_targets() : string {
          return (this.targets.length > 1)
            ? 'group(' + this.targets.join(',') + ')'
            : this.targets[0]
        }

        /**
         * Return a new query with the targets timeshifted.
         */
        shift(interval: string) {
          var group = this._group_targets()
          return new ts.models.data.Query({
            name: this.name + '_shift_' + interval,
            targets: [
              'timeShift(' + group + ', \"' + interval + '\")'
            ]
          })
        }

        /**
         * Return a new query with the targets from this query and another
         * query joined into a 2-target array, for comparison presentations.
         */
        join(other) : Query {
          var target_this  = this._group_targets()
          var target_other = other._group_targets()
          return new ts.models.data.Query({
            name: this.name + '_join_' + other.name,
            targets: [
              target_this,
              target_other
            ]
          })
        }

        /**
         * Process the results of executing the query, transforming
         * the returned structure into something consumable by the
         * charting library, and calculating sums.
         */
        _summarize(response_data) : Query {
          this.perf.start('summarize')
          this.summation = new ts.models.data.Summation(response_data)
          this.data = response_data.map((series) => {
            series.summation = new ts.models.data.Summation(series).toJSON()
            return series
          })
          this.perf.end('summarize')
          return this
        }

        /**
         * Fetch data processed for use by a particular chart renderer, and
         * cache it in the query object so it's not re-processed over and
         * over.
         */
        chart_data(type: string) : any {
          var cache_key = 'chart_data_' + type
          if (!this.cache.has(cache_key)){
            this.perf.start('convert')
            this.cache.set(cache_key, ds.charts.process_data(this.data, type))
            this.perf.end('convert')
          }
          return this.cache.get(cache_key)
        }

        performance_data() : any {
          return {
            load:      this.perf.get_last_measure('load'),
            summarize: this.perf.get_last_measure('summarize'),
            convert:   this.perf.get_last_measure('convert')
          }
        }

        toJSON() : any {
          var json : any = {}
          if (this.name)
            json.name = this.name
          if (this.targets)
            json.targets = this.targets
          if (this.data)
            json.data = this.data
          if (this.summation)
            json.summation = this.summation.toJSON()
          if (this.options)
            json.options = this.options
          return json
        }
      } // end class Query

    } // end module data
  } // end module models
} // end module ts
