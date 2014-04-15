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
        this.sum += other.sum;
        this.datapoint_count += other.datapoint_count;
        this.mean = this.sum / this.datapoint_count;
        if (other.min < this.min) {
            this.min = other.min;
        }
        if (other.max > this.max) {
            this.max = other.max;
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
        bean.fire(this, 'loading');
        $.ajax({
            dataType: "json",
            url: this.url
        }).done(completionHandler(this));
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
        this.data = _.map(data, function(series) {
            series.summation = new cronenberg.Summation(series);
            series.key = series.target;
            series.values = series.datapoints;
            return series;
        });
        this.summation = new cronenberg.Summation();
        // Oh, scoping
        var sum = this.summation;
        _.each(this.data, function(series) {
            sum.merge(series.summation);
        });
        return this;
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

    this.add = function(name, url) {
        query = new cronenberg.Query(name, url);
        this.registry[name] = query;
        return query;
    };

    this.loadAll = function() {
        for (var query_name in this.registry) {
            this.registry[query_name].load();
        }
    };
};

cronenberg.queries = new cronenberg.QueryRegistry();
