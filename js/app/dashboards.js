cronenberg.DashboardHolder = function(url_, element_) {
    this.url = url_;
    this.dashboard = null;
    this.element = element_;
    this.elementToItemMap = {};

    this.findPresentationForElement = function(element_id) {
        var self = this;
        return self.elementToItemMap[element_id];
    };

    this.findQueryForElement = function(element_id) {
        var self = this;
        var presentation = self.findPresentationForElement(element_id);
        return self.findQueryForPresentation(presentation);
    };

    this.findQueryForPresentation = function(presentation) {
      var self = this;
      var query = self.dashboard.definition.queries[presentation.query];
      return query;
    };

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

cronenberg.DashboardManager = function() {
    this.current = null;

    /**
     * Register an event handler for processing a dashboard once it's
     * loaded and ready.
     */
    this.onDashboardLoaded = function(handler) {
        var self = this;
        bean.on(self, cronenberg.events.DASHBOARD_LOADED, handler);
        return self;
    };

    /**
     * Register an event handler for processing the list of dashboards
     * once they're loaded.
     */
    this.onDashboardListLoaded = function(handler) {
        var self = this;
        bean.on(self, cronenberg.events.DASHBOARD_LIST_LOADED, handler);
        return self;
    };

    /**
     * List all dashboards.
     */
    this.list = function(path, handler) {
        var path = path || '/api/dashboard';
        var self = this;
        $.ajax({
            dataType: 'json',
            url: path
        }).done(function(data) {
            handler(data);
            bean.fire(self, cronenberg.events.DASHBOARD_LIST_LOADED, data);
        });
    };

    /**
       * Recurse through the presentation tree, giving each dashboard
       * item an element ID, and checking to see if we have any
       * components that require the raw data queries to be made.
       *
       * Use dashboard.visit() when we convert to using the model
       * objects.
     */
    this._prep_items = function(dashboard, holder, interactive) {
      var id = 0;

      dashboard.visit(function(item) {
        if (!item.item_type)
          return;
        item.set_element_id('d' + id++);
        holder.elementToItemMap[item.element_id] = item;
        item.set_interactive(interactive);
        // Now that we have a proper client side model, this logic
        // should move to the model objects
        switch (item.item_type) {
          case 'singlestat':
          case 'jumbotron_singlestat':
          case 'summation_table':
          case 'donut_chart':
          holder.raw_data_required = true;
          break;
        }
      });
    }

    /**
     * Set up us the API call.
     */
    this._prep_url = function(base_url) {
      var url = URI(base_url).setQuery('rendering', true);
      var context = url.query(true);
      var params = URI(window.location).query(true);
      var variables = {};
      context.from = context.from || params.from || '-3h';
      context.until = context.until || params.until;

      url.setQuery('from', context.from);
      if (context.until) {
        url.setQuery('until', context.until);
      }
        for (key in params) {
            if (key.indexOf('p[') == 0) {
                var name = key.slice(2, -1);
                variables[name] = params[key];
            }
        }
      context.url = url.href();
      context.variables = variables;
      if (params.interactive) {
        context.interactive == params.interactive != 'false';
      }
      return context;
    };

    /**
     * Load and render a dashboard.
     */
    this.load = function(url, element) {
        var self = this;
        var holder = new cronenberg.DashboardHolder(url, element);
        var context = self._prep_url(url);
        self.current = holder;
        $.ajax({
            dataType: "json",
            url: context.url
        }).done(function(data) {
          var dashboard = ds.models.dashboard(data.dashboards[0]).render_templates(context.variables);
          holder.dashboard = dashboard;

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

          bean.fire(self, cronenberg.events.DASHBOARD_LOADED, dashboard);
        });
        return self;
    };

  this.change_layout = function(layout) {
    var self = this;
    var new_layout = layout.transform(self.current.dashboard.definition);

    self.current.dashboard.definition.set_items([new_layout]);
    $(self.current.element).html(self.current.dashboard.definition.render());
    self.current.dashboard.definition.load_all();
  };

    this.refresh = function() {
        var self = this;
        if (self.current) {
            self.load(self.current.url, self.current.element);
        }
    };

    // Definitely getting to the point we need some kind of reactive MVC
    // here
    this.toggle_interactive_charts = function() {
        var self = this;
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
    };

    /* -----------------------------------------------------------------------------
       Time range and auto-refresh
       ----------------------------------------------------------------------------- */

    this.set_time_range = function(from, until) {
        var self = this;
        var location = URI(window.location).setQuery('from', from).href();
        window.history.pushState({url: self.current.url, element:self.current.element}, '', location);

        self.current.setRange(from, until);
        bean.fire(self, cronenberg.events.RANGE_CHANGED, {
            from: from, until: until
        });
        self.refresh();
    };

    this.ranges = {
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
    };

    this.getRangeDescription = function(range) {
        var self = this;
        if (range in self.ranges) {
            return self.ranges[range];
        } else {
            return null;
        }
    };

    this.onRangeChanged = function(handler) {
        var self = this;
        bean.on(self, cronenberg.events.RANGE_CHANGED, handler);
    };

    this.autoRefreshInterval = null;
    this.intervalId = null;

    this.set_refresh_interval = function(value) {
        var self = this;
        var intervalSeconds = parseInt(value);
        self.autoRefreshInterval = intervalSeconds;
        if (self.intervalId) {
            window.clearInterval(self.intervalId);
        }
        if (intervalSeconds > 0) {
            self.intervalSeconds = intervalSeconds;
            self.intervalId = window.setInterval(self.refresh, intervalSeconds * 1000);
        }
    };

    this.delete_with_confirmation = function(href, handler) {
        var self = this;
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
    };

    this.delete_dashboard = function(href, done_) {
        var self = this;
        var done = done_ || function() {
            window.location = '/dashboards';
        };
        $.ajax({
            url: href,
            type: 'DELETE'
        }).done(done);
    };

    this.delete_current = function() {
        var self = this;
        self.delete_with_confirmation(self.current.dashboard.href);
    };

    // Oh this is ugly
    this.duplicate = function(href, handler) {
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
                });
            });
        })
    };
};

cronenberg.dashboards = new cronenberg.DashboardManager();
