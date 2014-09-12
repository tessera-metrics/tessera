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
          lines: {
            show: true,
            lineWidth: 1,
            steps: false,
            fill: false
          },
          stack: null,
          points: { show: false },
          bars: { show: false }
        },
        xaxis: {
          mode: "time",
          tickFormatter: function(value) {
            return moment(value).tz(ds.config.DISPLAY_TIMEZONE).format('h:mm A')
          },
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
          borderWidth: 1,
          hoverable: true,
          clickable: true,
          autoHighlight: false,
          /* grid.color actually sets the color of the legend
           * text. WTH? */
          color: theme_colors.fgcolor,
          borderColor: theme_colors.minorGridLineColor
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

    function get_flot_options(item, base) {
      var options      = item.options || {}
      var flot_options = ds.extend(get_default_options(), base)

      if (options.palette)
        flot_options.colors = ds.charts.util.get_palette(options.palette)

      if (options.y1 && options.y1.min)
        flot_options.yaxes[0].min = options.y1.min
      if (options.y2 && options.y2.min)
        flot_options.yaxes[1].min = options.y2.min

      if (options.y1 && options.y1.max)
        flot_options.yaxes[0].max = options.y1.max
      if (options.y2 && options.y2.max)
        flot_options.yaxes[1].max = options.y2.max

      return flot_options
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

    function render_legend(item, query, flot_options) {
      var legend_id = '#ds-legend-' + item.item_id
      var legend = ''
      var data = query.chart_data('flot')
      for (var i in data) {
        var series = data[i]
        var label = series.label
        var color = flot_options.colors[i % flot_options.colors.length]

        var cell = '<div class="ds-legend-cell">'
                 + '<span class="color" style="background-color:' + color + '"></span>'
                 + '<span class="label" style="color:' + flot_options.xaxis.font.color +  '">' + label + '</span>'
                 + '</div>'
        legend += cell
      }
      var elt = $(legend_id)
      elt.html(legend)
      elt.equalize({equalize: 'outerWidth', reset: true })
    }


    self.simple_line_chart = function(e, item, query) {
      var context = {
          plot: null
      }
      setup_plugins(e, context)

      var flot_options = get_flot_options(item, {
        grid: {
          show: false
        },
        legend: {
          show: false
        }
      })

      context.plot = $.plot($(e), [query.chart_data('flot')[0]],
                            flot_options)
      return self
    }

    self.standard_line_chart = function(e, item, query) {
      var context = {
          plot: null
      }
      setup_plugins(e, context)
      var flot_options = get_flot_options(item, {
        grid: ds.extend(get_default_options().grid, {
          hoverable: true,
          clickable: true,
          autoHighlight: false
        }),
        legend: {
          show: false
        }
      })

      context.plot = $.plot($(e), query.chart_data('flot'), flot_options)
      render_legend(item, query, flot_options)

      return self
    }

    self.simple_area_chart = function(e, item, query) {
      var options = item.options || {}
      var context = {
          plot: null
      }
      setup_plugins(e, context)
      var flot_options = ds.extend(get_default_options(), {
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
      })

      context.plot = $.plot($(e), [query.chart_data('flot')[0]],
                            flot_options)
      return self
    }


    self.stacked_area_chart = function(e, item, query) {
      var context = {
          plot: null
      }
      var legend_id = '#ds-legend-' + item.item_id
      var flot_options = get_flot_options(item, {
        legend: {
          container: legend_id,
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
      })

      setup_plugins(e, context)
      context.plot = $.plot($(e), query.chart_data('flot'), flot_options)

      render_legend(item, query, flot_options)
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
