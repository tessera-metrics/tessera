cronenberg.DashboardManager = function() {
    this.registry = {};

    /**
     * Register an event handler for processing a dashboard once it's
     * loaded and ready.
     */
    this.onDashboardLoaded = function(handler) {
        bean.on(this.registry, cronenberg.events.DASHBOARD_LOADED, handler);
        return this;
    };

    this.load = function(url) {
        var registry = this.registry;
        $.ajax({
            dataType: "json",
            url: url
        }).done(function(data) {
            var dashboard = data.entities[0];
            registry[dashboard.name] = dashboard;

            // Build a map from the presentation elements to their
            // model objects.
            dashboard.elementToItemMap = {};
            _.each(dashboard.grid.rows, function(row) {
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
            for (var query_name in dashboard.queries) {
                cronenberg.queries.add(query_name, dashboard.queries[query_name]);
            }
            bean.fire(registry, cronenberg.events.DASHBOARD_LOADED, dashboard);
        });
    };
};

cronenberg.dashboards = new cronenberg.DashboardManager();
