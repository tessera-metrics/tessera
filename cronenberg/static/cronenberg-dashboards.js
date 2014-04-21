cronenberg.DashboardHolder = function(url_, element_) {
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

cronenberg.DashboardManager = function() {
    this.current = null,

    /**
     * Register an event handler for processing a dashboard once it's
     * loaded and ready.
     */
    this.onDashboardLoaded = function(handler) {
        var self = this;
        bean.on(self, cronenberg.events.DASHBOARD_LOADED, handler);
        return self;
    };

    this.onDashboardListLoaded = function(handler) {
        console.log("cronenberg.dashboards.onDashboardListLoaded()");
        var self = this;
        bean.on(self, cronenberg.events.DASHBOARD_LIST_LOADED, handler);
        return self;
    }

    /**
     * List all dashboards.
     */
    this.list = function() {
        console.log("cronenberg.dashboards.list()");
        var self = this;
        $.ajax({
            dataType: 'json',
            url: '/api/dashboard'
        }).done(function(data) {
            console.log("cronenberg.dashboards.list() - done");
            _.each(data.dashboards, function(dashboard) {
                dashboard.last_modified = moment(dashboard.last_modified_date).fromNow();
                dashboard.created = moment(dashboard.creation_date).format('MMMM Do YYYY');
                console.log(dashboard);
            });
            bean.fire(self, cronenberg.events.DASHBOARD_LIST_LOADED, data);
        });
    };

    /**
     * Load and render a dashboard.
     */
    this.load = function(url, element) {
        var self = this;
        self.current = new cronenberg.DashboardHolder(url, element);
        $.ajax({
            dataType: "json",
            url: url
        }).done(function(data) {
            var dashboard = data
            self.current.dashboard = dashboard;

            // Build a map from the presentation elements to their
            // model objects.
            dashboard.elementToItemMap = {};
            _.each(dashboard.definition.grid.rows, function(row) {
                if (row.item_type == 'row') {
                    _.each(row.cells, function(cell) {
                        _.each(cell.presentation, function(presentation) {
                            if (typeof(presentation.element_id) != "undefined") {
                                dashboard.elementToItemMap[presentation.element_id] = presentation;
                            }
                        });
                    });
                }
            });

            // Set up the queries
            cronenberg.queries.clear();
            for (var query_name in dashboard.definition.queries) {
                cronenberg.queries.add(query_name, dashboard.definition.queries[query_name]);
            }

            // Render the dashboard
            var rendered = cronenberg.templates.render_presentation(dashboard.definition);
            $(self.current.element).html(rendered);

            var currentURL = URI(self.current.url);

            bean.fire(self, cronenberg.events.RANGE_CHANGED, {
                from: currentURL.query('from'),
                until: currentURL.query('until')
            });

            // Load the queries
            cronenberg.queries.loadAll();

            bean.fire(self, cronenberg.events.DASHBOARD_LOADED, dashboard);
        });
        return self;
    };

    this.refresh = function() {
        var self = this;
        if (self.current) {
            self.load(self.current.url, self.current.element);
        }
    };

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

    this.delete_current = function() {
        var self = this;
        var uri = '/api/dashboard/' + self.current.dashboard.dashboard.id;
        console.log("Deleting " + uri);
        $.ajax({
            url: uri,
            type: 'DELETE'
        }).done(function() {
            console.log("Deleted ");
            window.location = '/dashboards';
        });
    };
};

cronenberg.dashboards = new cronenberg.DashboardManager();
