ds.charts = ds.charts || {}

ds.charts.nvd3 =
  (function() {

    var self = {}

    self.DEFAULT_AUTO_HIDE_LEGEND_THRESHOLD = 6;

    self.simple_line_chart = function(e, series, options_) {
        var options = options_ || {};
      var data = [series];
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
                .color(ds.charts.util._color_function(options.palette || ds.charts.DEFAULT_PALETTE))
                .margin(options.margin || { top: 0, right: 16, bottom: 0, left: 40 })
                .width(width)
                .height(height);
            chart.yAxis.tickFormat(d3.format(options.yAxisFormat || ',.2f'));
            chart.xAxis.tickFormat(function(d) { return moment.unix(d).fromNow(); });
            d3.select(e.selector + ' svg')
                .attr('width', width)
                .attr('height', height)
                .datum(data)
                .call(chart);
            return chart;
        });
    }

    self.standard_line_chart = function(e, data, options_) {
        var options = options_ || {};
        var showLegend = options.showLegend !== false;
        if (data.length > self.DEFAULT_AUTO_HIDE_LEGEND_THRESHOLD) {
            showLegend = false;
        }
        nv.addGraph(function() {
            var width = e.width();
            var height = e.height();
            var chart = nv.models.lineChart()
                .options({
                    showXAxis: options.showXAxis !== false,
                    showYAxis: options.showYAxis !== false,
                    showLegend: showLegend,
                    useInteractiveGuideline: options.useInteractiveGuideline !== false,
                    x: function(d) { return d[1]; },
                    y: function(d) { return d[0]; }
                })
                .color(ds.charts.util._color_function(options.palette || ds.charts.DEFAULT_PALETTE))
                .margin(options.margin || { top: 12, right: 16, bottom: 16, left: 40 })
                .width(width)
                .height(height);
            chart.yAxis
                .axisLabelDistance(options.yAxisLabelDistance || 30)
                .axisLabel(options.yAxisLabel || null)
                .tickFormat(d3.format(options.yAxisFormat || ',.2f'));
            chart.xAxis
                .tickFormat(function(d) { return moment.unix(d).format('h:mm A'); })
                .axisLabel(options.xAxisLabel || null);
            d3.select(e.selector + ' svg')
                .attr('width', width)
                .attr('height', height)
                .datum(data)
                .call(chart);
            return chart;
        });
    }

    self.simple_area_chart = function(e, series, options_) {
        var options = options_ || {};
      var data = [series];
        nv.addGraph(function() {
            var width  = e.width();
            var height = e.height();
            var chart  = nv.models.stackedAreaChart()
                .options({
                    showLegend: false,
                    showControls: false,
                    showXAxis: false,
                    showYAxis: false,
                    useInteractiveGuideline: true,
                    x: function(d) { return d[1]; },
                    y: function(d) { return d[0]; }
                })
                .color(ds.charts.util._color_function(options.palette || ds.charts.DEFAULT_PALETTE))
                .style('stack')
                .width(width)
                .height(height)
                .margin(options.margin || { top: 0, right: 0, bottom: 0, left: 0 });
            chart.yAxis
                .tickFormat(d3.format(options.yAxisFormat || ',.2f'));
            chart.xAxis
            // .tickFormat(function(d) { return moment.unix(d).format('h:mm A'); });
                .tickFormat(function(d) { return moment.unix(d).fromNow(); });
            d3.select(e.selector + ' svg')
                .attr('width', width)
                .attr('height', height)
                .datum(data)
                .transition()
                .call(chart);
            return chart;
        });
    }


    self.stacked_area_chart = function(e, data, options_) {
        var options = options_ || {};
        var showLegend = options.showLegend !== false;
        if (data.length > self.DEFAULT_AUTO_HIDE_LEGEND_THRESHOLD) {
            showLegend = false;
        }
        nv.addGraph(function() {
            var width  = e.width();
            var height = e.height();
            var chart  = nv.models.stackedAreaChart()
                .options({
                    showLegend: showLegend,
                    useInteractiveGuideline: options.useInteractiveGuideline !== false,
                    showXAxis: options.showXAxis !== false,
                    showYAxis: options.showYAxis !== false,
                    x: function(d) { return d[1]; },
                    y: function(d) { return d[0]; }
                })
                .color(ds.charts.util._color_function(options.palette || ds.charts.DEFAULT_PALETTE))
                .style(options.style || 'stack')
                .width(width)
                .height(height)
                .margin(options.margin || { top: 12, right: 16, bottom: 16, left: 40 });
            chart.yAxis
                .axisLabel(options.yAxisLabel || null)
                .axisLabelDistance(options.yAxisLabelDistance || 30)
                .tickFormat(d3.format(options.yAxisFormat || ',.2f'));
            chart.xAxis
                .axisLabel(options.xAxisLabel || null)
                .tickFormat(function(d) { return moment.unix(d).format('h:mm A'); });
            // .tickFormat(function(d) { return moment.unix(d).fromNow(); });
            d3.select(e.selector + ' svg')
                .attr('width', width)
                .attr('height', height)
                .datum(data)
                .transition()
                .call(chart);
            return chart;
        });
    }

    self.donut_chart = function(e, series, options_, transform_) {
        var options = options_ || {};
        var transform = transform_ || 'sum';
        /* var showLegend = options.showLegend !== false;
           if (list_of_series.length > self.DEFAULT_AUTO_HIDE_LEGEND_THRESHOLD) {
           showLegend = false;
           } */
        var data = series.map(function(series) {
            return {
                label: series.key,
                y: series.summation[transform]
            };
        });
        nv.addGraph(function() {
            var width  = e.width();
            var height = e.height();
            var chart  = nv.models.pieChart()
            /* .options({
               showLegend: showLegend,
               useInteractiveGuideline: options.useInteractiveGuideline !== false,
               x: function(d) { return d.key; },
               y: function(d) { return d.y; }
               }) */
                .color(ds.charts.util._color_function(options.palette || ds.charts.DEFAULT_PALETTE))
                .labelType(options.labelType || "percent")
                .donut(options.donut !== false)
                .donutRatio(options.donutRatio || 0.3)
                .showLabels(options.showLabels !== false)
                .donutLabelsOutside(options.donutLabelsOutside !== false)
                .width(width)
                .height(height)
                .margin(options.margin || { top: 0, right: 0, bottom: 0, left: 0 });
            d3.select(e.selector + ' svg')
                .attr('width', width)
                .attr('height', height)
                .datum(data)
                .transition()
                .call(chart);
            return chart;
        });
    }

    return self
})()
