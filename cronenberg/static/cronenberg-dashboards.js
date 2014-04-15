cronenberg.DashboardManager = function() {
    this.registry = {};

    this.load = function(url, handler) {
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
            handler(dashboard);
        });
    };
};

cronenberg.dashboards = new cronenberg.DashboardManager();
