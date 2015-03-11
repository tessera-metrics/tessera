/**
 * Chart provider for rendering dashboard chart with flot, which
 * provides Canvas-based interactivity.
 */
(function() {

    var self = ds.charts.provider({
      name:          'flot',
      is_interactive: true,
      description: 'flot renders interactive charts using HTML canvas.'
    })

    var log = ds.log.logger('ds.charts.flot')

    /* =============================================================================
       Helpers
       ============================================================================= */

    var FORMAT_STANDARD = d3.format(',.3s')
    var FORMAT_PERCENT  = d3.format('%')

    function get_default_options() {
      var theme_colors = ds.charts.util.get_colors()
      var default_options = {
        colors: ds.charts.util.get_palette(),
        downsample: false,
        series: {
          lines: {
            show: true,
            lineWidth: 1,
            steps: false,
            fill: false
          },
          valueLabels: { show: false },
          points: { show: false },
          bars: { lineWidth: 1, show: false },
          stackD3: { show: false }
        },
        xaxis: {
          mode: "time",
          tickFormatter: function(value, axis) {
            // Take care of time series axis
            if (axis.tickSize && axis.tickSize.length === 2) {
              if (axis.tickSize[1] === 'year' && axis.tickSize[0] >= 1)
                return moment(value).tz(ds.config.DISPLAY_TIMEZONE).format('YYYY')
              if (axis.tickSize[1] === 'month' && axis.tickSize[0] >= 1 || axis.tickSize[1] === 'year')
                return moment(value).tz(ds.config.DISPLAY_TIMEZONE).format('MM-\'YY')
              if (axis.tickSize[1] === 'day' && axis.tickSize[0] >= 1 || axis.tickSize[1] === 'month')
                return moment(value).tz(ds.config.DISPLAY_TIMEZONE).format('MM/DD')
              if (axis.tickSize[1] === 'hour' && axis.tickSize[0] >= 12)
                return moment(value).tz(ds.config.DISPLAY_TIMEZONE).format('MM/DD hA')
            }
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
            position: 'left',
            tickFormatter: FORMAT_STANDARD,
            reserveSpace: 30,
            labelWidth: 30,
            tickColor: theme_colors.minorGridLineColor,
            font: {
              color: theme_colors.fgcolor,
              size: 12
            }
          },
          {
            position: 'right',
            tickFormatter: FORMAT_STANDARD,
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
        legend: { show: false },
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
      var flot_options = $.extend(true, {}, get_default_options(), base)

      flot_options.colors = ds.charts.util.get_palette(options.palette)

      if (options.y1 && options.y1.min)
        flot_options.yaxes[0].min = options.y1.min
      if (options.y2 && options.y2.min)
        flot_options.yaxes[1].min = options.y2.min

      if (options.y1 && options.y1.max)
        flot_options.yaxes[0].max = options.y1.max
      if (options.y2 && options.y2.max)
        flot_options.yaxes[1].max = options.y2.max

      if (options.y1 && options.y1.label)
        flot_options.yaxes[0].axisLabel = options.y1.label
      if (options.y2 && options.y2.label)
        flot_options.yaxes[1].axisLabel = options.y2.label

      if (item.show_max_value || item.show_min_value || item.show_last_value) {
        flot_options.series.valueLabels = {
          show: true,
          showMaxValue:item.show_max_value,
          showMinValue: item.show_min_value,
          showLastValue: item.show_last_value,
          showAsHtml: true,
          labelFormatter: FORMAT_STANDARD,
          yoffset: -20
        }
      }

      return flot_options
    }

    function show_tooltip(x, y, contents, offset) {
      $('<div id="ds-tooltip">' + contents + '</div>').css( {
        position: 'absolute',
        display: 'none',
        top: y + (offset || 5),
        left: x + (offset || 5)
      }).appendTo("body").show()
    }

    function setup_plugins(container, context) {

      $(container).bind("multihighlighted", function(event, pos, items) {
        if ( !items )
          return
        var is_percent = context.item.stack_mode && (context.item.stack_mode === ds.charts.StackMode.PERCENT)
        var data   = context.plot.getData()
        var item   = items[0]
        var point  = data[item.serieIndex].data[item.dataIndex]

        var contents = ds.templates.flot.tooltip({
          time: point[0],
          items: items.map(function(item) {
                   var s = data[item.serieIndex]
                   var value = is_percent
                             ? s.percents[item.dataIndex]
                             : s.data[item.dataIndex][1]
                   return {
                     series: s,
                     value: is_percent ? FORMAT_PERCENT(value) : FORMAT_STANDARD(value)
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

    function render_legend(item, query, options) {
      var legend_id = '#ds-legend-' + item.item_id
      if ( item.legend === ds.models.chart.LegendType.SIMPLE ) {
        render_simple_legend(legend_id, item, query, options)
      } else if ( item.legend === ds.models.chart.LegendType.TABLE ) {
        // TODO - render a summation_table as the legend
      }
    }

    function render_simple_legend(legend_id, item, query, options) {
      var legend = ''
      var data = query.chart_data('flot')
      for (var i = 0; i < data.length; i++) {
        var series = data[i]
        if (item.hide_zero_series && series.summation.sum === 0)
          continue
        var label = series.label
        var color = options.colors[i % options.colors.length]

        var cell = '<div class="ds-legend-cell">'
                 + '<span class="color" style="background-color:' + color + '"></span>'
                 + '<span class="label" style="color:' + options.xaxis.font.color +  '">' + label + '</span>'
                 + '</div>'
        legend += cell
      }
      var elt = $(legend_id)
      elt.html(legend)
      elt.equalize({equalize: 'outerWidth', reset: true })
    }

    function render(e, item, query, options, data) {
      if (typeof(data) === 'undefined')
        data = query.chart_data('flot')
      var context = {
          plot: null,
          item: item,
          query: query
      }
      setup_plugins(e, context)
      if (ds.prefs.downsample && options.downsample) {
        options.series.downsample = {
          /**
           * TODO: making downsampling factor configurable might be
           * nice.  This downsamples to approximately a little less
           * than 1 point per pixel (using 80% of the element width to
           * account for margins, etc...).
           */
          threshold: Math.floor(e.width() * 0.8)
        }
      } else {
        options.series.downsample = { threshold: 0 }
      }
      try {
        context.plot = $.plot($(e), data, options)
      } catch (ex) {
        log.error('Error rendering item ' + item.item_id
                 + ': ' + ex.message)
        log.error(ex.stack)
      }
      render_legend(item, query, options)
      return context
    }

    /* =============================================================================
       Chart provider interface
       ============================================================================= */

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

    self.simple_line_chart = function(e, item, query) {
      var options = get_flot_options(item, {
        grid: { show: false },
        downsample: true
      })

      render(e, item, query, options, [query.chart_data('flot')[0]])

      return self
    }

    self.standard_line_chart = function(e, item, query) {
      render(e, item, query, get_flot_options(item, {
        downsample: true
      }))
      return self
    }

    self.simple_area_chart = function(e, item, query) {
      var options = get_flot_options(item, {
        downsample: true,
        grid: { show: false },
        series: {
          lines: { fill: 1.0 },
          grid: { show: false }
        }
      })

      render(e, item, query, options, [query.chart_data('flot')[0]])

      return self
    }

    self.stacked_area_chart = function(e, item, query) {
      var options = get_flot_options(item, {
        downsample: true,
        series: {
          lines: { fill: 1},
          stackD3: {
            show: true,
            offset: 'zero'
          }
        }
      })

      if (item.stack_mode === ds.charts.StackMode.PERCENT) {
        options.series.stackD3.offset = 'expand'
        options.yaxes[0].max = 1
        options.yaxes[0].min = 0
        options.yaxes[0].tickFormatter = FORMAT_PERCENT
      } else if (item.stack_mode == ds.charts.StackMode.STREAM) {
        options.series.stackD3.offset = 'wiggle'
      } else if (item.stack_mode == ds.charts.StackMode.NONE) {
        options.series.stackD3.show = false
        options.series.lines.fill = false
      }

      render(e, item, query, options)

      return self
    }

    self.donut_chart = function(e, item, query) {
      var options = get_flot_options(item, {
        crosshair: { mode: null },
        multihighlight: { mode: null },
        series: {
          lines: { show: false },
          pie: {
            show: true,
            radius: 'auto',
            innerRadius: item.is_pie ? 0 : 0.35,
            label: { show: item.labels },
            highlight: {
              opacity: 0
            }
          }
        },
        grid: { show: false, hoverable: true }
      })

      var transform = item.transform || 'sum'
      var data = query.chart_data('flot').map(function(series) {
                   if (item.hide_zero_series && series.summation.sum === 0)
                     return undefined
                   return {
                     label: series.label,
                     summation: series.summation,
                     data: [ series.label, series.summation[transform] ]
                   }
                 }).filter(function(item) { return item })

      var context = render(e, item, query, options, data)

      $(e).bind('plothover', function(event, pos, event_item) {
        if (event_item) {
          var contents = ds.templates.flot.donut_tooltip({
            series: event_item.series,
            value: FORMAT_STANDARD(event_item.datapoint[1][0][1]),
            percent: FORMAT_PERCENT(event_item.series.percent / 100)
          })
          $("#ds-tooltip").remove()
          show_tooltip(pos.pageX, pos.pageY, contents)
        } else {
          $("#ds-tooltip").remove()
        }
      })


      return self
    }

    var THREE_HOURS_MS = 1000 * 60 * 60 * 3
    var ONE_HOUR_MS = 1000 * 60 * 60 * 1

    self.bar_chart = function(e, item, query) {
      var series      = query.chart_data('flot')[0]
      var ts_start    = series.data[0][0]
      var ts_end      = series.data[series.data.length - 1][0]
      var ts_length   = ts_end - ts_start
      var sample_size = ts_length / series.data.length

      var bar_scaling = 0.85
      if (ts_length > THREE_HOURS_MS) {
        bar_scaling = 0.15
      } else if (ts_length > ONE_HOUR_MS) {
        bar_scaling = 0.65
      } else {
        bar_scaling = 0.85
      }

      var options = get_flot_options(item, {
        series: {
          lines: { show: false },
          stackD3: {
            show: true,
            offset: 'zero'
          },
          bars: {
            show: true,
            fill: 0.8,
            barWidth: sample_size * bar_scaling
          }
        }
      })

      if (item.stack_mode === ds.charts.StackMode.PERCENT) {
        options.series.stackD3.offset = 'expand'
        options.yaxes[0].max = 1
        options.yaxes[0].min = 0
        options.yaxes[0].tickFormatter = FORMAT_PERCENT
      } else if (item.stack_mode == ds.charts.StackMode.STREAM) {
        options.series.stackD3.offset = 'wiggle'
      } else if (item.stack_mode == ds.charts.StackMode.NONE) {
        options.series.stackD3.show = false
      }

      render(e, item, query, options)

      return self
    }

    self.discrete_bar_chart = function(e, item, query) {
      var is_horizontal = item.orientation === 'horizontal'
      var format = d3.format(item.format)
      var options = get_flot_options(item, {
        xaxis: { mode: null },
        multihighlight: { mode: null },
        crosshair: { mode: null },
        grid: {
          borderWidth: 0,
          color: 'transparent',
          borderColor: 'transparent',
          labelMargin: 10
        },
        series: {
          lines: { show: false },
          bars: {
            horizontal: is_horizontal,
            show: true,
            barWidth: 0.8,
            align: 'center',
            fill: 0.75,
            numbers: {
              show: item.show_numbers,
              xAlign: 'center',
              font: '10pt Helvetica',
              fontColor: '#f9f9f9', // TODO: get from theme
              formatter: format,
              yAlign: function(y) { return y },
              xAlign: function(x) { return x }
            }
          }
        }
      })

      var transform = item.transform || 'sum'
      var index = 0
      var data = query.chart_data('flot').map(function(series) {
                   if (item.hide_zero_series && series.summation.sum === 0)
                     return undefined
                   return {
                     label: series.label,
                     data: [
                       is_horizontal
                            ? [ series.summation[transform], index]
                            : [index, series.summation[transform]]
                     ],
                     color: options.colors[options.colors % index++]
                   }
                 }).filter(function(item) { return item })
      index = 0
      var ticks = data.map(function(series) {
                              return [index++, series.label]
                            })

      if (is_horizontal) {
        options.yaxes[0].tickLength = 0
        options.yaxes[0].ticks = ticks
        options.xaxis.tickFormatter = null
        options.series.bars.numbers.xOffset = -18
        if (item.show_grid) {
          options.xaxis.axisLabel = options.yaxes[0].axisLabel
          options.yaxes[0].axisLabel = transform.charAt(0).toUpperCase() + transform.substring(1)
        } else {
          options.xaxis.ticks = []
          options.yaxes[0].axisLabel = null
        }
      } else {
        options.xaxis.tickLength = 0
        options.xaxis.ticks = ticks
        options.series.bars.numbers.yOffset = 12
        if (!item.show_grid) {
          options.yaxes[0].ticks = []
          options.yaxes[0].axisLabel = null
        } else {
          options.xaxis.axisLabel = transform.charAt(0).toUpperCase() + transform.substring(1)
        }
      }

      var context = render(e, item, query, options, data)
      $(e).bind('plothover', function(event, pos, event_item) {
        if (event_item) {
          var contents = ds.templates.flot.discrete_bar_tooltip({
            series: event_item.series,
            value: format(event_item.datapoint[1])
          })
          $("#ds-tooltip").remove()
          show_tooltip(pos.pageX, pos.pageY, contents)
        } else {
          $("#ds-tooltip").remove()
        }
      })

      return self
    }



    ds.charts.registry.register(self)

})()
