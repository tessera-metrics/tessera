/**
 * Class - Representation of a query and all its current state.
 */
cronenberg.Query = function(name, url) {
    this.name = name;
    this.url = url;
    this.data = [];
    this.presentations = [];

    /**
     * Asynchronously execute this query, notifying any registered
     * listeners on start and completion.
     */
    this.load = function() {
        var self = this;
        bean.fire(self, 'loading');
        $.ajax({
            dataType: "json",
            url: self.url
        }).done(completionHandler(self));
    };

    this.fire = function() {
        var self = this;
        bean.fire(self, cronenberg.events.DATA_AVAILABLE, self)
    };

    this.available = function(handler) {
        bean.on(this, cronenberg.events.DATA_AVAILABLE, handler);
    };

    /**
     * Process the results of executing the query, transforming
     * the returned structure into something consumable by the
     * charting library, and calculating sums.
     */
    this.process_data = function(data) {
        var self = this;
        self.data = data.map(function(series) {
            series.summation = ds.models.data.Summation(series);
            series.key = series.target;
            series.values = series.datapoints;
            return series;
        });
        self.summation = ds.models.data.Summation();
        // Oh, scoping
        var sum = self.summation;
        self.data.forEach(function(series) {
            sum.merge(series.summation);
        });
        return self;
    };

    var completionHandler = function(query) {
        return function(data, textStatus) {
            query.process_data(data);
            bean.fire(query, cronenberg.events.DATA_AVAILABLE, query);
        };
    };
};

/**
 * Class - a registry of named queries.
 */
cronenberg.QueryRegistry = function() {
    this.registry = {};

    this.clear = function() {
        var self = this;
        for (var query_name in self.registry) {
            delete self.registry[query_name];
        }
        return self;
    },

    this.add = function(name, url) {
        var self = this;
        var query = new cronenberg.Query(name, url);
        self.registry[name] = query;
        return self;
    };

    this.loadAll = function(fireOnly) {
        var self = this;
        for (var query_name in self.registry) {
            if (fireOnly) {
                self.registry[query_name].fire();
            } else {
                self.registry[query_name].load();
            }
        }
        return self;
    };
};

cronenberg.queries = new cronenberg.QueryRegistry();
