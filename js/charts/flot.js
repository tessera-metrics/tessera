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
          timezone: ds.config.DISPLAY_TIMEZONE,
          tickColor: theme_colors.minorGridLineColor,
          font: {
            color: theme_colors.fgcolor,
            size: 12
          }
        },
        yaxes: [
          {
            tickFormatter: d3.format(',.3s'),
            reserveSpace: 30,
            labelWidth: 30,
            tickColor: theme_colors.minorGridLineColor,
            font: {
              color: theme_colors.fgcolor,
              size: 12
            }
          },
          {
            tickFormatter: d3.format(',.3s'),
            font: {
              color: theme_colors.fgcolor,
              size: 12
            }
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
          position: 'sw',
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
          color: "#BBB",
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

        var contents = ds.templates.flot.tooltip({
          time: point[0],
          items: items.map(function(item) {
                   return {
                     series: series[item.serieIndex],
                     value: series[item.serieIndex].data[item.dataIndex][1]
                   }
                 })
        })

        $("#ds-tooltip").remove()
        show_tooltip(pos.pageX, pos.pageY, contents)
      })

      $(container).bind("unmultihighlighted", function(event) {
        $("#ds-tooltip").remove()
      })

    }

    self.simple_line_chart = function(e, item, query) {
      var options = item.options || {}
      var context = {
          plot: null
      }
      setup_plugins(e, context)
      context.plot = $.plot($(e), [query.chart_data('flot')[0]],
                            ds.extend(get_default_options(), {
                              colors: ds.charts.util.get_palette(options.palette),
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
      var options = item.options || {}
      var context = {
          plot: null
      }
      setup_plugins(e, context)
      var defaults = get_default_options()
      context.plot = $.plot($(e), query.chart_data('flot'),
                            ds.extend(get_default_options(), {
                              colors: ds.charts.util.get_palette(options.palette),
                              grid: ds.extend(defaults.grid, {
                                borderWidth: 0,
                                hoverable: true,
                                clickable: true,
                                autoHighlight: false
                              }),
                              legend: {
                                container: '#ds-legend-' + item.item_id,
                                labelBoxBorderColor: 'transparent',
                                show: true,
                                noColumns: 4
                              }
                            }))
      return self
    }

    self.simple_area_chart = function(e, item, query) {
      var options = item.options || {}
      var context = {
          plot: null
      }
      setup_plugins(e, context)
      context.plot = $.plot($(e), [query.chart_data('flot')[0]],
                            ds.extend(get_default_options(), {
                              colors: ds.charts.util.get_palette(options.palette),
                              grid: {
                                show: false
                              },
                              legend: {
                                show: false
                              },
                              series: {
                                lines: {
                                  show: true,
                                  fill: 1
                                }
                              }
                            }))
      return self
    }

    self.stacked_area_chart = function(e, item, query) {
      var options = item.options || {}
      var context = {
          plot: null
      }
      setup_plugins(e, context)
      context.plot = $.plot($(e), query.chart_data('flot'),
                            ds.extend(get_default_options(), {
                              colors: ds.charts.util.get_palette(options.palette),
                              legend: {
                                container: '#ds-legend-' + item.item_id,
                                labelBoxBorderColor: 'transparent',
                                show: true,
                                noColumns: 4
                              },
                              series: {
                                lines: { show: true, lineWidth: 1, fill: 1},
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
