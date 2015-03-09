ds.DashboardHolder = function(url, element) {
  "use strict"

  this.url = url
  this.element = element
  this.dashboard = null

    this.setRange = function(from, until) {
        var self = this
        var url = URI(self.url)
        if (from) {
            url.setQuery('from', from)
        }
        if (until) {
            url.setQuery('until', until)
        }
        self.url = url.href()
    }
}

ds.manager =
  (function() {
    "use strict"

    var current
      , self = {}
      , log = ds.log.logger('tessera.app.manager')

    Object.defineProperty(self, 'current', { get: function() { return current }})

    self.set_current = function(_) {
      current = _
      return self
    }

    /**
     * Register an event handler for processing a dashboard once it's
     * loaded and ready.
     */
    self.onDashboardLoaded = function(handler) {
        ds.event.on(self, ds.app.Event.DASHBOARD_LOADED, handler)
        return self
    }

    /**
     * List all dashboards.
     */
    self.list = function(path, handler) {
        var path = path || ds.uri('/api/dashboard')
        $.ajax({
            dataType: 'json',
            url: path
        }).done(function(data) {
            handler(data)
        }).error(function(xhr, status, error) {
          self.error('Error listing dashboards. ' + error)
        })
    }

    self.default_error_handler = function(xhr, status, error) {
      console.log(xhr)
      console.log(status)
      console.log(error)
      self.error('Oops')
    }

    self.error = function(message, options_) {
      var options = options_ || {}
      options.type = options.type || 'danger'
      $.growl({
        message: message,
        title: 'Error',
        icon: 'fa fa-exclamation-circle'
      }, options)
    }

    self.warning = function(message, options_) {
      var options = options_ || {}
      options.type = options.type || 'warning'
      $.growl({
        message: message,
        title: options.title || 'Warning',
        icon: options.icon || 'fa fa-exclamation-circle'
      }, options)
    }

    self.success = function(message, options_) {
      var options = options_ || {}
      options.type = options.type || 'success'
      $.growl({
        message: message,
        title: options.title || 'Success',
        icon: options.icon || 'fa fa-check-circle'
      }, options)
    }

    /**
     * Recurse through the presentation tree, giving each dashboard
     * item an element ID, and checking to see if we have any
     * components that require the raw data queries to be made.
     */
    self._prep_items = function(dashboard, holder, interactive) {
      dashboard.visit(function(item) {
        if (!item.item_type)
          return
        if (item.requires_data) {
          holder.raw_data_required = true
        }
      })
    }

    /**
     * Set up us the API call.
     */
    self._prep_url = function(base_url, options) {
      var url = URI(base_url).setQuery('rendering', true)
      var context = ds.context(url.query(true))

      context.from = options.from || context.from
      context.until = context.until || options.until

      url.setQuery('from', context.from)
      if (context.until) {
        url.setQuery('until', context.until)
      }

      context.url = url.href()

      if (typeof(options.interactive) != 'undefined') {
        context.interactive = options.interactive
      } else if (context.params.interactive) {
        context.interactive = context.params.interactive != 'false'
      }

      return context
    }

    /**
     * Load and render a dashboard.
     */
    self.load = function(url, element, options_) {
      log.debug('load(): ' + url)
      window.performance.clearMarks()

      if (self.current && self.current.dashboard) {
        self.current.dashboard.cleanup()
      }
      var options = options_ || {}
      var holder = new ds.DashboardHolder(url, element)
      var context = self._prep_url(url, options)
      self.set_current(holder)
      $.ajax({
        dataType: "json",
        url: context.url
      }).error(function(xhr, status, error) {
        self.error('Error loading dashboard. ' + error)
      }).done(function(data) {
        var dashboard = ds.models.dashboard(data)
        holder.dashboard = dashboard

        if (data.preferences.renderer) {
          ds.charts.provider = ds.charts.registry.get(data.preferences.renderer)
        }

          ds.event.fire(self, ds.app.Event.DASHBOARD_LOADED, dashboard)

          dashboard.render_templates(context.variables)

          var interactive = ds.charts.provider.is_interactive
          if (context.interactive != undefined) {
            interactive = context.interactive
          }
          holder.raw_data_required = interactive
          ds.charts.interactive = interactive

          // Build a map from the presentation elements to their
          // model objects.
          self._prep_items(dashboard, holder, interactive)

          // Render the dashboard
          $(element).html(dashboard.definition.render())

          var currentURL = URI(holder.url)
          ds.event.fire(self, ds.app.Event.RANGE_CHANGED, {
            from: currentURL.query('from'),
            until: currentURL.query('until')
          })

          if (self.current_transform) {
            self.apply_transform(self.current_transform.transform, self.current_transform.target, false, context)
          } else {
            // Load the queries
            dashboard.definition.load_all({
              from: context.from,
              until: context.until
            }, !holder.raw_data_required)
          }

          ds.event.fire(self, ds.app.Event.DASHBOARD_RENDERED, dashboard)

          if (context.params.mode) {
            ds.app.switch_to_mode(context.params.mode)
          } else {
            ds.app.refresh_mode()
          }
        })
        return self
    }

    /**
     * Re-render a dashboard item and update its DOM representation.
     */
    self.update_item_view = function(item) {
      var element = $('#' + item.item_id)
      var visible = ds.edit.details_visibility(item)
      element.replaceWith(item.render())
      if (visible) {
        ds.edit.show_details(item.item_id)
      }
      item.visit(function(i) {
        var query = i.query_override || i.query
        if (query && query.is_query) {
          log.debug('update_item_view(): reloading query ' + query.name)
          query.load()
        }
      })
      ds.app.refresh_mode()
    }

    /**
     * Execute a function with re-rendering of the DOM for dashboard
     * items disabled.
     */
    self.without_updates = function(handler) {
      var fn = self.update_item_view
      self.update_item_view = function() { }
      try {
        return handler()
      } finally {
        self.update_item_view = fn
      }
    }

    self.handle_popstate = function(event) {
      if (!event.state) {
        self.current_transform = undefined
        self.refresh()
        ds.app.switch_to_mode('standard')
      } else {
        if (event.state.transform) {
          var item = ds.manager.current.dashboard.get_item(event.state.target.item_id)
          self.apply_transform(event.state.transform.name, item, false)
        } else if (event.state.url) {
          self.current_transform = undefined
          self.refresh()
          ds.app.switch_to_mode('standard')
        }
      }
    }

    window.addEventListener('popstate', self.handle_popstate)

    self.remove_transform = function() {
      window.location = URI(window.location)
                        .path(self.current.dashboard.view_href)
                        .href()
      self.current_transform = undefined
    }

    self.apply_transform = function(transform, target, set_location, context) {
      var dashboard = self.current.dashboard
      if (typeof(set_location) === 'undefined')
        set_location = true

      if (typeof(transform) === 'string')
        transform = ds.transforms.get(transform)

      log.debug('apply_transform(' + transform.name + ')')

      if (transform.transform_type == 'dashboard' && typeof(target) === 'undefined') {
          target = dashboard.definition
      }

      /**
       * Set browser URL state
       */
      if (set_location) {
        var url = URI(window.location)
        if (target.item_type != 'dashboard_definition') {
          url.segment(target.item_id.toString())
        }
        url.segment('transform').segment(transform.name)
        window.history.pushState({ url:self.current.url,
                                   element:self.current.element,
                                   transform:transform.toJSON(),
                                   target:target.toJSON() }, '', url.href())
      }

      /**
       * update_item_view() reloads queries, which we don't want to do
       * while processing the transform.
       */
      var result = self.without_updates(function() {
                     return transform.transform(target)
                   })

      dashboard.definition.queries = result.get_queries() // this could go in an observer
      dashboard.set_items([result])

      $('#' + dashboard.definition.item_id).replaceWith(dashboard.render())
      dashboard.render_templates(ds.context().variables)
      if (context) {
        dashboard.load_all({
          from: context.from,
          until: context.until
        })
      } else {
        dashboard.load_all()
      }

      if ((transform.transform_type === 'presentation') && (ds.app.current_mode != ds.app.Mode.EDIT)) {
        ds.app.switch_to_mode('transform')
        self.current_transform = {
          transform: transform,
          target: target
        }
      }

      return self
    }

    self.refresh = function() {
      log.debug('refresh()')
      if (self.current && (ds.app.current_mode != ds.app.Mode.EDIT)) {
        self.load(self.current.url, self.current.element)
      } else {
        if (log.is_enabled(ds.log.Level.DEBUG)) {
          log.debug('skipping reload; current mode: ' + ds.app.current_mode)
        }
      }
    }

    // Definitely getting to the point we need some kind of reactive MVC
    // here
    self.toggle_interactive_charts = function() {
        $.get(ds.uri('/api/preferences'), function(data) {
            var setting = !data.interactive
            var dashboard_url = URI(self.current.url)
            var window_url = URI(window.location)

            if (window_url.hasQuery('interactive', 'true')) {
                setting = false
            } else if (window_url.hasQuery('interactive', 'false')) {
                setting = true
            }

            dashboard_url.setQuery('interactive', setting)
            window_url.setQuery('interactive', setting)
            self.current.url = dashboard_url.href()
            window.history.pushState({url: self.current.url, element:self.current.element}, '', window_url.href())
            self.refresh()
            return setting == 'true'
        })
    }

    /* -----------------------------------------------------------------------------
       Time range and auto-refresh
       ----------------------------------------------------------------------------- */

    self.set_time_range = function(from, until) {
        var uri = URI(window.location)
        from
            ? uri.setQuery('from', from)
            : uri.removeQuery('from')
        until
            ? uri.setQuery('until', until)
            : uri.removeQuery('until')

        window.history.pushState({url: self.current.url, element:self.current.element}, '', uri.href())

        self.current.setRange(from, until)
        ds.event.fire(self, ds.app.Event.RANGE_CHANGED, {
            from: from, until: until
        })
      self.refresh()
    }

    self.ranges = {
        // TODO - quick hack. Parse the range and generate on the fly
        // for maximum flexibiliy
        '-1h'  : 'Past Hour',
        '-2h'  : 'Past 2 Hours',
        '-3h'  : 'Past 3 Hours',
        '-4h'  : 'Past 4 Hours',
        '-6h'  : 'Past 6 Hours',
        '-12h' : 'Past 12 Hours',
        '-1d'  : 'Past Day',
        '-7d'  : 'Past Week'
    }

    self.getRangeDescription = function(range) {
        if (range in self.ranges) {
            return self.ranges[range]
        } else {
            return null
        }
    }

    self.onRangeChanged = function(handler) {
        var self = this
        ds.event.on(self, ds.app.Event.RANGE_CHANGED, handler)
    }

    self.autoRefreshInterval = null
    self.intervalId = null

    self.set_refresh_interval = function(value) {
        var intervalSeconds = parseInt(value)
        self.autoRefreshInterval = intervalSeconds
        if (self.intervalId) {
          if (log.is_enabled(ds.log.Level.DEBUG)) {
            log.debug('clearing auto-refresh interval; intervalId: ' + self.intervalId)
          }
          window.clearInterval(self.intervalId)
          self.intervalId = undefined
        }
        if (intervalSeconds > 0) {
            self.intervalSeconds = intervalSeconds
            self.intervalId = window.setInterval(self.refresh, intervalSeconds * 1000)
          if (log.is_enabled(ds.log.Level.DEBUG)) {
            log.debug('set auto-refresh interval; intervalId: ' + self.intervalId + '; seconds: ' + intervalSeconds)
          }
        }
    }

    self.delete_with_confirmation = function(href, handler) {
        bootbox.dialog({
            message: "Are you really sure you want to delete this dashboard? Deletion is irrevocable.",
            title: "Confirm dashboard delete",
            backdrop: false,
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: "btn-default",
                    callback: function() {
                        // TODO - notification
                    }
                },
                confirm: {
                    label: "Delete",
                    className: "btn-danger",
                    callback: function() {
                        self.delete_dashboard(href, handler)
                    }
                }
            }
        })
    }

    self.delete_dashboard = function(href, done_) {
      var done = done_ || function() {
                            window.location = '/dashboards'
                            self.success('Successfully deleted dashboard ' + href)
                          }
        $.ajax({
            url: href,
            type: 'DELETE'
        }).done(done).error(function(xhr, status, error) {
          self.error('Error deleting dashboard ' + href + ' ' + error)
        })
    }

    self.delete_current = function() {
        self.delete_with_confirmation(self.current.dashboard.href)
    }

    self.create = function(dashboard, handler) {
      $.ajax({
        type: 'POST',
        url: ds.uri('/api/dashboard/'),
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(dashboard)
      }).done(function(data) {
        if (handler && handler instanceof Function) {
          handler(data)
        }
      }).error(function(xhr, status, error) {
        self.error('Error creating dashboard. ' + error)
      })
    }

    self.update = function(dashboard, handler) {
      $.ajax({
        type: 'PUT',
        url: dashboard.href,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(dashboard)
      }).done(function(data) {
        if (handler && handler instanceof Function) {
          handler(data)
        }
      }).error(function(xhr, status, error) {
        self.error('Error updating dashboard ' + dashboard.title + '. ' + error)
      })
    }

    self.update_definition = function(dashboard, handler) {
      $.ajax({
        type: 'PUT',
        url: dashboard.definition_href,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(dashboard.definition)
      }).done(function(data) {
        if (handler && handler instanceof Function) {
          handler(data)
        }
      }).error(function(xhr, status, error) {
        self.error('Error updating dashboard definition ' + dashboard.title + '. ' + error)
      })
    }



    // Oh this is ugly
    self.duplicate = function(href, handler) {
        // Get dashboard
        $.get(href, function(data) {
            var dashboard = data
            dashboard.title = 'Copy of ' + dashboard.title

            // Get definition
            $.get(href + '/definition', function(data) {
                dashboard.definition = data
                // Duplicate dashboard
                $.ajax({
                    type: 'POST',
                    url: ds.uri('/api/dashboard/'),
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(dashboard)
                }).done(function(data) {
                    if (handler) {
                        handler()
                    }
                }).error(function(xhr, status, error) {
                  self.error('Error duplicating dashboard ' + href + '. ' + error)
                })
            })
        })
    }


   return self
})()
