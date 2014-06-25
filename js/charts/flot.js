ds.charts = ds.charts || {}

/**
 * Chart provider for rendering dashboard chart with flot, which
 * provides Canvas-based interactivity.
 */
ds.charts.flot =
  (function() {

    var self = {}

    self.CHART_IMPL_TYPE = 'flot'

    function get_default_options() {
      var theme_colors = ds.charts.util.get_colors()
      var default_options = {
        colors: ds.charts.util.get_palette(),
        series: {
          lines: { show: true, lineWidth: 1, fill: false},
          stack: null,
          points: { show: false },
          bars: { show: false }
        },
        xaxis: {
          mode: "time",
          twelveHourClock: true,
          // timeformat: '',
          tickColor: theme_colors.minorGridLineColor
          // axisLabel: 'Time'
        },
        yaxes: [
          {
            tickFormatter: d3.format(',3s'), /* TODO: get from item options */
            reserveSpace: 30,
            labelWidth: 30,
            tickColor: theme_colors.minorGridLineColor
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
          borderWidth: 0,
          hoverable: true,
          clickable: true,
          autoHighlight: false,
          /* grid.color actually sets the color of the legend
           * text. WTH? */
          color: theme_colors.fgcolor
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
      return default_options
    }

    function show_tooltip(x, y, contents) {
      $('<div id="ds-tooltip">' + contents + '</div>').css( {
        position: 'absolute',
        display: 'none',
        top: y + 5,
        left: x + 5
      }).appendTo("body").show()
    }

    function setup_plugins(container, context) {
      $(container).bind("multihighlighted", function(event, pos, items) {
        if ( !items )
          return
        var series = context.plot.getData()
        var item = items[0]
        var point = series[item.serieIndex].data[item.dataIndex]
        /* TODO: should do all this with handlebars templates; this is
         * left over from looong ago */
        var contents
              = '<table class="table table-condensed"><tbody>'
              + '<tr><span class="ds-tooltip-time">'
              + moment(point[0]).format('dd, h:mm:ss A UTC')
              + '</span></tr>'
        $.each(items, function(index, item) {
          var ser = series[item.serieIndex]
          var pair = ser.data[item.dataIndex]
          /* TODO: get a formatter from the item's options */
          var format = d3.format(',.3s')
          contents += ( "<tr>"
                        // Badge + name
                      + "<td class='ds-tooltip-label'><span class='badge' style='background-color: "
                      + ser.color + "'><i></i></span> "
                      + ser.label + "</td>"
                        // Value
                      + "<td class='ds-tooltip-value'>"
                      + format(pair[1])
                      + "</td>"
                      + "</tr>"
                      )
        })
        contents += "</tbody></table>"

        $("#ds-tooltip").remove()
        show_tooltip(pos.pageX, pos.pageY, contents)
      })

      $(container).bind("unmultihighlighted", function(event) {
        $("#ds-tooltip").remove()
      })

    }

    self.simple_line_chart = function(e, item, query) {
      var context = {
          plot: null
      }
      setup_plugins(e, context)
      context.plot = $.plot($(e), [query.chart_data('flot')[0]], ds.extend(get_default_options(), {
        grid: {
          show: false
        },
        legend: {
          show: false
        }
      }))
      return self
    }

    self.standard_line_chart = function(e, item, query) {
      var context = {
          plot: null
      }
      setup_plugins(e, context)
      context.plot = $.plot($(e), query.chart_data('flot'), ds.extend(get_default_options(), {
        grid: {
          borderWidth: 0,
          hoverable: true,
          clickable: true,
          autoHighlight: false
        },
        multihighlight: {
          mode: "x"
        },

      }))
      return self
    }

    self.simple_area_chart = function(e, item, query) {
      var context = {
          plot: null
      }
      setup_plugins(e, context)
      context.plot = $.plot($(e), [query.chart_data('flot')[0]], ds.extend(get_default_options(), {
        grid: {
          show: false
        },
        legend: {
          show: false
        },
        series: {
          lines: {
            show: true,
            fill: true
          }
        }
      }))
      return self
    }

    self.stacked_area_chart = function(e, item, query) {
      var context = {
          plot: null
      }
      setup_plugins(e, context)
      context.plot = $.plot($(e), query.chart_data('flot'), ds.extend(get_default_options(), {
        series: {
          lines: { show: true, lineWidth: 1, fill: true},
          stack: true,
          points: { show: false },
          bars: { show: false }
        }
      }))
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
                      return [point[1] * 1000, point[0]]
                    })
      return result
    }

    return self
  })()
