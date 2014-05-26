ds.charts = ds.charts || {}

ds.charts.flot =
  (function() {

    var self = {}
      , default_options = {
        colors: ['#ecb796','#dc8f70','#b2a470','#92875a','#716c49','#d2ed82','#bbe468','#a1d05d','#e7cbe6','#d8aad6','#a888c2','#9dc2d3','#649eb9','#387aa3'].reverse(),

        series: {
          lines: { show: true, lineWidth: 1, fill: false},
          stack: null,
          points: { show: false },
          bars: { show: false }
        },
        xaxis: {
          mode: "time",
          twelveHourClock: true,
          color: '#ccc',
          tickColor:'#333'
          // axisLabel: 'Time'
        },
        yaxes: [
          {
            // tickFormatter: opendash.format_kmbt,
            reserveSpace: 30,
            labelWidth: 30,
            color: '#ccc',
            tickColor: '#333'
            // axisLabel: 'Things'
          },
          {
            // tickFormatter: opendash.format_kmbt,
            color: '#ccc'
          }
        ],
        points: {
          show: false,
          radius: 2,
          symbol: "circle"
        },
        shadowSize: 0,
        legend: {
          container: null,
          noColumns: 2,
          position: 'nw',
          backgroundColor: 'transparent',
          labelBoxBorderColor: 'transparent'
        },
        grid: {
          borderWidth: 1,
          borderColor: "#AAAAAA",
          hoverable: true,
          clickable: true,
          autoHighlight: false,
          /* grid.color actually sets the color of the legend
           * text. WTH? */
          color: '#ccc'
        },
        selection: {
          mode: "x",
          color: "red"
        },
        multihighlight: {
          mode: "x"
        },
        crosshair: {
          mode: "x",
          color: "red",
          lineWidth: 1
        }
      }

    self.CHART_IMPL_TYPE = 'flot'

    self.simple_line_chart = function(e, item, query) {
      $.plot($(e), [query.chart_data('flot')[0]], self.default_options)
      // ds.charts.nvd3.simple_line_chart(e, series, options)
      return self
    }

    self.standard_line_chart = function(e, item, query) {
      $.plot($(e), query.chart_data('flot'), self.default_options)
      return self
    }

    self.simple_area_chart = function(e, item, query) {
      $.plot($(e), [query.chart_data('flot')[0]], self.default_options)
      // ds.charts.nvd3.simple_area_chart(e, series, options)
      return self
    }

    self.stacked_area_chart = function(e, item, query) {
      $.plot($(e), query.chart_data('flot'), self.default_options)
      // ds.charts.nvd3.stacked_area_chart(e, data, options)
      return self
    }

    self.donut_chart = function(e, item, query) {
      ds.charts.nvd3.donut_chart(e, item, query)
      return self
    }

    self.process_series = function(series) {
      var result = {}
      if (series.summation) {
        result.summation = series.summation
      }
      result.label = series.target
      result.data = series.datapoints.map(function(point) {
                      return [point[1], point[0]]
                    })
      return result
    }

    return self
  })()
