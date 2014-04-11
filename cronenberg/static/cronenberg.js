var cronenberg = {

    queries: {},

    /**
     * TODO: should return a query object with chainable methods to
     * register for events, etc...
     */
    add_query: function(name, url) {
        // console.log("cronenberg.add_query(): " + name + ' ' + url);
        this.queries[name] = {
            name: name,
            url: url,
            data: [],
            presentations: []
        };
    },

    _makeHandler: function(query) {
        // console.log("cronenberg._makeHandler()");
        return function(data, textStatus) {
            query.data = _.map(data, function(series) {
                series.summation = cronenberg.reduce_series(series);
                series.key = series.target;
                series.values = series.datapoints;
                // console.log(series);
                return series;
                /*
  WHY DOES THIS FAIL?
              return {
                    key: series.target,
                    values: series.datapoints,
                    summation: this.reduce_series(series)
                };
*/
            });
            bean.fire(query, 'data-available', query);
        };
    },


    load_queries: function() {
        // console.log("cronenberg.load_queries()");
        for (var query_name in this.queries) {
            // console.log('  load_queries(): ' + query_name);
            var query = this.queries[query_name]
            // console.log(query);


            // Notify any consumers of this query that it's reloading
            bean.fire(query, 'loading');

            $.ajax({
                dataType: "json",
                url: query.url
            }).done(this._makeHandler(query));
        }
    },

    activity: function(element) {
        // console.log("cronenberg.activity()");
        /*
        $(element).activity({
            width: 4,
            segments: 8,
            length: 6,
            space: 2
        }); */
    },

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
        // console.log("cronenberg.reduce_series()");
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
    },

    simple_line_chart: function(e, series) {
        var data = [{
            values: series.datapoints,
            key: series.target
        }];
        nv.addGraph(function() {
            var width = e.width();
            var height = e.height();
            var chart = nv.models.lineChart()
                .options({
                    showXAxis: false,
                    showYAxis: false,
                    showLegend: false,
                    useInteractiveGuideline: true,
                    x: function(d) { return d[1]; },
                    y: function(d) { return d[0]; }
                })
                .width(width)
                .height(height)
                .margin({ top: 0, right: 0, bottom: 0, left: 0 });
            chart.yAxis.tickFormat(d3.format(',.2f'));
            chart.xAxis.tickFormat(function(d) { return moment.unix(d).fromNow(); });
            d3.select(e.selector + ' svg')
                .attr('width', width)
                .attr('height', height)
                .datum(data)
                .call(chart);
            return chart;
        });
    }
};
