cronenberg.DashboardHolder = function(url_, element_) {
  "use strict";

    this.url = url_;
    this.dashboard = null;
    this.element = element_;

    this.setRange = function(from, until) {
        var self = this;
        var url = URI(self.url);
        if (from) {
            url.setQuery('from', from);
        }
        if (until) {
            url.setQuery('until', until);
        }
        self.url = url.href();
    };
};

ds.manager =
  (function() {
    "use strict";

    var current
      , self = {};

    Object.defineProperty(self, 'current', { get: function() { return current; }});

    self.set_current = function(_) {
      current = _;
      return self;
    }

    /**
     * Register an event handler for processing a dashboard once it's
     * loaded and ready.
     */
    self.onDashboardLoaded = function(handler) {
        bean.on(self, cronenberg.events.DASHBOARD_LOADED, handler);
        return self;
    }

    /**
     * List all dashboards.
     */
    self.list = function(path, handler) {
        var path = path || '/api/dashboard'
        $.ajax({
            dataType: 'json',
            url: path
        }).done(function(data) {
            handler(data);
        }).error(function(xhr, status, error) {
          self.error('Error listing dashboards. ' + error);
        })
    }

    self.default_error_handler = function(xhr, status, error) {
      console.log(xhr);
      console.log(status);
      console.log(error);
      self.error('Oops');
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
       *
       * Use dashboard.visit() when we convert to using the model
       * objects.
     */
    self._prep_items = function(dashboard, holder, interactive) {
      dashboard.visit(function(item) {
        if (!item.item_type)
          return;
        item.set_interactive(interactive);
        if (item.requires_data) {
          holder.raw_data_required = true;
        }
      });
    }

    /**
     * Set up us the API call.
     */
    self._prep_url = function(base_url, options) {
      var url = URI(base_url).setQuery('rendering', true);
      var context = url.query(true);
      var params = URI(window.location).query(true);
      var variables = {};
      context.from = context.from || params.from || options.from || '-3h'
      context.until = context.until || params.until || options.until

      url.setQuery('from', context.from);
      if (context.until) {
        url.setQuery('until', context.until);
      }
      for (var key in params) {
        /* compatibility w/gdash params */
        if (key.indexOf('p[') == 0) {
          var name = key.slice(2, -1)
          variables[name] = params[key]
        } else {
          variables[key] = params[key]
        }
      }
      context.url = url.href()
      context.variables = variables

      if (typeof(options.interactive) != 'undefined') {
        context.interactive = options.interactive
      } else if (params.interactive) {
        context.interactive = params.interactive != 'false'
      }
      return context
    }

    /**
     * Load and render a dashboard.
     */
    self.load = function(url, element, options_) {
      var options = options_ || {}
        var holder = new cronenberg.DashboardHolder(url, element);
        var context = self._prep_url(url, options);
        self.set_current(holder);
        $.ajax({
            dataType: "json",
            url: context.url
        }).error(function(xhr, status, error) {
          self.error('Error loading dashboard. ' + error);
        }).done(function(data) {
          var dashboard = ds.models.dashboard(data.dashboards[0])
          holder.dashboard = dashboard

          bean.fire(self, 'ds-dashboard-loaded', dashboard);

          dashboard.render_templates(context.variables)

          var interactive = data.preferences.interactive;
          if (context.interactive != undefined) {
            interactive = context.interactive;
          }
          holder.raw_data_required = interactive;

          // Build a map from the presentation elements to their
          // model objects.
          self._prep_items(dashboard, holder, interactive);

          // Render the dashboard
          $(holder.element).html(dashboard.definition.render());

          var currentURL = URI(holder.url);
          bean.fire(self, cronenberg.events.RANGE_CHANGED, {
            from: currentURL.query('from'),
            until: currentURL.query('until')
          });

          // Load the queries
          dashboard.definition.load_all({
            base_url: data.config.GRAPHITE_URL,
            from: context.from,
            until: context.until,
            fire_only: !holder.raw_data_required
          });

          bean.fire(self, 'ds-dashboard-rendered', dashboard);
        });
        return self;
    }

    self.update_item_view = function(item) {
      var element = $('#' + item.item_id)
      element.replaceWith(item.render())
      item.query.load({ fire_only: true })
    }

  self.change_layout = function(layout) {
    var new_layout = layout.transform(self.current.dashboard.definition);

    self.current.dashboard.set_items([new_layout]);
    $(self.current.element).replaceWith(self.current.dashboard.render());
    self.current.dashboard.load_all();
  }

    self.refresh = function() {
      if (self.current) {
        self.load(self.current.url, self.current.element);
      }
    }

    // Definitely getting to the point we need some kind of reactive MVC
    // here
    self.toggle_interactive_charts = function() {
        $.get('/api/preferences', function(data) {
            var setting = !data.preferences.interactive;
            var dashboard_url = URI(self.current.url);
            var window_url = URI(window.location);

            if (window_url.hasQuery('interactive', 'true')) {
                setting = false;
            } else if (window_url.hasQuery('interactive', 'false')) {
                setting = true;
            }

            dashboard_url.setQuery('interactive', setting);
            window_url.setQuery('interactive', setting);
            self.current.url = dashboard_url.href();
            window.history.pushState({url: self.current.url, element:self.current.element}, '', window_url.href());
            self.refresh();
            return setting == 'true';
        });
    }

    /* -----------------------------------------------------------------------------
       Time range and auto-refresh
       ----------------------------------------------------------------------------- */

    self.set_time_range = function(from, until) {
        var location = URI(window.location).setQuery('from', from).href();
        window.history.pushState({url: self.current.url, element:self.current.element}, '', location);

        self.current.setRange(from, until);
        bean.fire(self, cronenberg.events.RANGE_CHANGED, {
            from: from, until: until
        });
        self.refresh();
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
            return self.ranges[range];
        } else {
            return null;
        }
    }

    self.onRangeChanged = function(handler) {
        var self = this;
        bean.on(self, cronenberg.events.RANGE_CHANGED, handler);
    }

    self.autoRefreshInterval = null;
    self.intervalId = null;

    self.set_refresh_interval = function(value) {
        var intervalSeconds = parseInt(value);
        self.autoRefreshInterval = intervalSeconds;
        if (self.intervalId) {
            window.clearInterval(self.intervalId);
        }
        if (intervalSeconds > 0) {
            self.intervalSeconds = intervalSeconds;
            self.intervalId = window.setInterval(self.refresh, intervalSeconds * 1000);
        }
    }

    self.delete_with_confirmation = function(href, handler) {
        bootbox.dialog({
            message: "Are you really sure you want to delete this dashboard? Deletion is irrevocable.",
            title: "Confirm dashboard delete",
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
                        self.delete_dashboard(href, handler);
                    }
                }
            }
        });
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
          self.error('Error deleting dashboard ' + href + ' ' + error);
        })
    }

    self.delete_current = function() {
        self.delete_with_confirmation(self.current.dashboard.href);
    }

    self.create = function(dashboard, handler) {
      $.ajax({
        type: 'POST',
        url: '/api/dashboard/',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(dashboard)
      }).done(function(data) {
        if (handler && handler instanceof Function) {
          handler(data);
        }
      }).error(function(xhr, status, error) {
        self.error('Error creating dashboard. ' + error);
      });
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
          handler(data);
        }
      }).error(function(xhr, status, error) {
        self.error('Error updating dashboard ' + dashboard.title + '. ' + error);
      });
    }


    // Oh this is ugly
    self.duplicate = function(href, handler) {
        // Get dashboard
        $.get(href, function(data) {
            var dashboard = data.dashboards[0];
            dashboard.title = 'Copy of ' + dashboard.title;

            // Get definition
            $.get(href + '/definition', function(data) {
                dashboard.definition = data.definition;
                // Duplicate dashboard
                $.ajax({
                    type: 'POST',
                    url: '/api/dashboard/',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(dashboard)
                }).done(function(data) {
                    if (handler) {
                        handler();
                    }
                }).error(function(xhr, status, error) {
                  self.error('Error duplicating dashboard ' + href + '. ' + error);
                });
            });
        })
    }

   return self;
})();
