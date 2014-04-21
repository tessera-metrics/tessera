/**
 * Class - Summarized stats for a data series or set of series. When
 * constructed with a data series, computes the sum, min, max, and
 * mean.
 */
cronenberg.Summation = function(series) {
    this.sum = 0;
    this.min = Number.MAX_VALUE;
    this.max = Number.MIN_VALUE;
    this.mean = 0;
    this.first = 0;
    this.last = 0;
    this.datapoint_count = 0;

    /**
     * Merge another summation into this one. For summarizing
     * queries with multiple data series.
     */
    this.merge = function(other) {
        var self = this;
        self.sum += other.sum;
        self.datapoint_count += other.datapoint_count;
        self.mean = self.sum / self.datapoint_count;
        if (other.min < self.min) {
            self.min = other.min;
        }
        if (other.max > self.max) {
            self.max = other.max;
        }
        return this;
    };

    // If constructed with a series passed in, process it.
    if (typeof(series) != "undefined") {
        this.first = series.datapoints[0][0];
        this.datapoint_count = series.datapoints.length;
        if (this.first == null) {
            this.first = 0;
        }
        _.reduce(series.datapoints, function(context, point) {
            var value = point[0] == null ? 0 : point[0];
            context.sum = context.sum + value;
            if (value > context.max) {
                context.max = value;
            }
            if (value < context.min) {
                context.min = value;
            }
            context.last = value;
            return context;
        }, this);
        this.mean = this.sum / series.datapoints.length;
    }
};

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
        self.data = _.map(data, function(series) {
            series.summation = new cronenberg.Summation(series);
            series.key = series.target;
            series.values = series.datapoints;
            return series;
        });
        self.summation = new cronenberg.Summation();
        // Oh, scoping
        var sum = self.summation;
        _.each(self.data, function(series) {
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
        query = new cronenberg.Query(name, url);
        self.registry[name] = query;
        return self;
    };

    this.loadAll = function() {
        var self = this;
        for (var query_name in self.registry) {
            self.registry[query_name].load();
        }
        return self;
    };
};

cronenberg.queries = new cronenberg.QueryRegistry();
