var cronenberg = {

    id: function(entity) {
        var name = '';
        if ( typeof(entity) == "string" )
            name = entity;
        else
            name = entity.name;
        return name.replace(/\./g, '_');
    },

    // Borrowed from Rickshaw
    format_kmbt: function(y) {
        value = y;
        suffix = '';
        if (y >= 1000000000000)   { value = y / 1000000000000; suffix = "T" }
        else if (y >= 1000000000) { value = y / 1000000000; suffix = "B" }
        else if (y >= 1000000)    { value = y / 1000000; suffix = "M" }
        else if (y >= 1000)       { value = y / 1000; suffix = "K" }
        else if (y < 1 && y > 0)  { value = y; }
        else if (y == 0)          { value = 0; }
        else                      { value = y }
        return value.toPrecision(3) + suffix;
    },

    /**
     * Process a single Graphite data series, returning an object with
     * the sum, min, max, mean, first, and last values.
     */
    reduce_series: function(series) {
        var sums = {
            sum: 0,
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE,
            mean: 0,
            first: 0,
            last: 0
        };
        sums.first = series.datapoints[0][0];
        if (sums.first == null) {
            sums.first = 0;
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
        }, sums);
        sums.mean = sums.sum / series.datapoints.length;
        return sums;
    }
};
