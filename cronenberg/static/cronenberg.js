var cronenberg = {

    /**
     * Class - Representation of a query and all its current state.
     */
    Query: function(name, url) {
        this.name = name;
        this.url = url;
        this.data = [];
        this.presentations = [];

        /**
         * Asynchronously execute this query, notifying any registered
         * listeners on start and completion.
         */
        this.load = function() {
            console.log("Query.load() " + this.name);
            bean.fire(this, 'loading');

            $.ajax({
                dataType: "json",
                url: this.url
            }).done(completionHandler(this));
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
            console.log("Query.process_data()");
            console.log(this.summation);
            var sum = this.summation;
            _.each(this.data, function(series) {
                sum.merge(series.summation);
            });
            return this;
        };

        var completionHandler = function(query) {
            return function(data, textStatus) {
                console.log("Query.dataHandler()");
                console.log(query);
                query.process_data(data);
                bean.fire(query, 'data-available', query);
            };
        };
    },


    /**
     * Class - Summarized stats for a data series or set of series.
     */
    Summation: function(series) {
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
    },

    queries: {},

    /**
     * TODO: should return a query object with chainable methods to
     * register for events, etc...
     */
    add_query: function(name, url) {
        // console.log("cronenberg.add_query(): " + name + ' ' + url);
        this.queries[name] = new cronenberg.Query(name, url);
    },

    load_queries: function() {
        console.log("cronenberg.load_queries()");
        for (var query_name in this.queries) {
            this.queries[query_name].load();
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
    },

    standard_line_chart: function(e, list_of_series) {
        var data = _.map(list_of_series, function(series) {
            return {
                key: series.target,
                values: series.datapoints
            };
        });
        nv.addGraph(function() {
            var width = e.width();
            var height = e.height();
            var chart = nv.models.lineChart()
                .options({
                    showXAxis: true,
                    showYAxis: true,
                    showLegend: true,
                    useInteractiveGuideline: true,
                    x: function(d) { return d[1]; },
                    y: function(d) { return d[0]; }
                })
                .color(cronenberg._color_function('Spectrum6'))
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
    },


    stacked_area_chart: function(e, list_of_series) {
        var data = _.map(list_of_series, function(series) {
            return {
                key: series.target,
                values: series.datapoints
            };
        });
        nv.addGraph(function() {
            var width  = e.width();
            var height = e.height();
            var chart  = nv.models.stackedAreaChart()
                .useInteractiveGuideline(true)
                .options({
                    showLegend: true,
                    useInteractiveGuideline: true,
                    x: function(d) { return d[1]; },
                    y: function(d) { return d[0]; }
                })
                .color(cronenberg._color_function('Spectrum6'))
                .width(width)
                .height(height)
                .margin({ top: 0, right: 0, bottom: 0, left: 0 });
            chart.yAxis.tickFormat(d3.format(',.2f'));
            chart.xAxis.tickFormat(function(d) { return moment.unix(d).fromNow(); });
            d3.select(e.selector + ' svg')
                .attr('width', width)
                .attr('height', height)
                .datum(data)
                .transition()
                .call(chart);
            return chart;
        });
    },

    _color_function: function(palette_name) {
        var palette = cronenberg.colors[palette_name];
        return function(d,i) {
            return palette[i % palette.length];
        }
    },


    colors: {
    // Some color palettes", handily compiled by the Stanford Vis
    // Group for their Color Palette Analyzer project.
    // http://vis.stanford.edu/color-names/analyzer/
    AppleSpectrum:[ "#2d588a", "#58954c", "#e9a044", "#c12f32", "#723e77", "#7d807f" ],
    AppleBlue:    [ "#4972a8", "#92b9d8", "#002d64", "#599bcf", "#134d8d" ],
    AppleBrown:   [ "#8b6c4f", "#c8b68e", "#3b291d", "#ae8e5d", "#713f24" ],
    AppleGrey:    [ "#717372", "#c0c2c1", "#2d2f2e", "#8c8e8d", "#484a49" ],
    AppleGreen:   [ "#2d632f", "#90b879", "#0d2d16", "#599a48", "#00431a" ],
    Tableau10:    [ "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b",
                    "#e377c2", "#7f7f7f", "#bcbd22", "#17becf" ],
    Tableau20:    [ "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a",
                    "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94",
                    "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d",
                    "#17becf", "#9edae5" ],
    ManyEyes:     [ "#9c9ede", "#7375b5", "#4a5584", "#cedb9c", "#b5cf6b", "#8ca252",
                    "#637939", "#e7cb94", "#e7ba52", "#bd9e39", "#8c6d31", "#e7969c",
                    "#d6616b", "#ad494a", "#843c39", "#de9ed6", "#ce6dbd", "#a55194",
                    "#7b4173" ],
    Numbers6:     [ "#2d588a", "#58954c", "#e9a044", "#c12f32", "#723e77", "#7d807f" ],
    Excel10:      [ "#365e96", "#983334", "#77973d", "#5d437c", "#36869f", "#d1702f",
                   "#8197c5", "#c47f80", "#acc484", "#9887b0" ],
    Economist:    [ "#621e15", "#e59076", "#128dcd", "#083c52", "#64c5f2", "#61afaf",
                    "#0f7369", "#9c9da1" ],
    BrewerQ9:     [ "#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33",
                    "#a65628", "#f781bf", "#999999" ],
    BrewerQ10:    [ "#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c",
                    "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a" ],
    BrewerQ12:    [ "#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462",
                    "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f" ],
    BrewerDiv1:   [ "#8c510a", "#d8b365", "#f6e8c3", "#f5f5f5", "#c7eae5", "#5ab4ac",
                    "#01665e" ],
    BrewerDiv2:   [ "#b2182b", "#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0", "#67a9cf",
                    "#2166ac" ],
    BrewerDiv3:   [ "#762a83", "#af8dc3", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#7fbf7b",
                    "#1b7837" ],
    BrewerDiv4:   [ "#d73027", "#fc8d59", "#fee090", "#ffffbf", "#e0f3f8", "#91bfdb",
                    "#4575b4" ],
    MarketMap :   [ "#fa0007", "#ac0000", "#4e0300", "#000000", "#005101", "#06a200",
                    "#07ff00" ],


    // Some more color palettes from Rickshaw
    Spectrum6:  ["#e7cbe6", "#d8aad6", "#a888c2", "#9dc2d3",
                  "#649eb9", "#387aa3"].reverse(),
    Spectrum14:  ["#ecb796", "#dc8f70", "#b2a470", "#92875a", "#716c49", "#d2ed82",
                  "#bbe468", "#a1d05d", "#e7cbe6", "#d8aad6", "#a888c2", "#9dc2d3",
                  "#649eb9", "#387aa3"].reverse(),
    Spectrum2000:["#57306f", "#514c76", "#646583", "#738394", "#6b9c7d", "#84b665",
                  "#a7ca50", "#bfe746", "#e2f528", "#fff726", "#ecdd00", "#d4b11d",
                  "#de8800", "#de4800", "#c91515", "#9a0000", "#7b0429", "#580839",
                  "#31082b"],
    Spectrum2001:["#2f243f", "#3c2c55", "#4a3768", "#565270", "#6b6b7c", "#72957f",
                  "#86ad6e", "#a1bc5e", "#b8d954", "#d3e04e", "#ccad2a", "#cc8412",
                  "#c1521d", "#ad3821", "#8a1010", "#681717", "#531e1e", "#3d1818",
                  "#320a1b"],
    Classic9:    ["#423d4f", "#4a6860", "#848f39", "#a2b73c", "#ddcb53", "#c5a32f",
                  "#7d5836", "#963b20", "#7c2626", "#491d37", "#2f254a"].reverse(),
    Colorwheel:  ["#b5b6a9", "#858772", "#785f43", "#96557e", "#4682b4", "#65b9ac",
                  "#73c03a", "#cb513a"].reverse(),
    Cool:        ["#5e9d2f", "#73c03a", "#4682b4", "#7bc3b8", "#a9884e", "#c1b266",
                  "#a47493", "#c09fb5"],
    Munin:       ["#00cc00", "#0066b3", "#ff8000", "#ffcc00", "#330099", "#990099",
                  "#ccff00", "#ff0000", "#808080", "#008f00", "#00487d", "#b35a00",
                  "#b38f00", "#6b006b", "#8fb300", "#b30000", "#bebebe", "#80ff80",
                  "#80c9ff", "#ffc080", "#ffe680", "#aa80ff", "#ee00cc", "#ff8080",
                  "#666600", "#ffbfff", "#00ffcc", "#cc6699", "#999900"],

    // Some more color palettes from d3.js
    D3Category10: [ "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b",
                    "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],

    D3Category20: ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a",
                   "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94",
                   "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d",
                   "#17becf", "#9edae5" ],

    D3Category20b: [ "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252",
                     "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94",
                     "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194",
                     "#ce6dbd", "#de9ed6" ],

    D3Category20c: ["#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#e6550d", "#fd8d3c",
                    "#fdae6b", "#fdd0a2", "#31a354", "#74c476", "#a1d99b", "#c7e9c0",
                    "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb", "#636363", "#969696",
                    "#bdbdbd", "#d9d9d9"]
    }
};
