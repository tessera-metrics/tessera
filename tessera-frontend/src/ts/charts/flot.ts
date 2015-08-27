import * as charts from './core'
import { ChartLegendType, Chart, StandardTimeSeries, StackedAreaChart } from '../models/items'
import Query from '../models/data/query'
import { AxisScale } from '../models/axis'
import { get_colors, get_palette } from './util'
import { extend } from '../core/util'
import { logger } from '../core/log'
import * as graphite from '../data/graphite'
import * as app from '../app/app'
import { render_legend } from './legend'
import XYChart from '../models/items/xychart'

declare var URI, $, d3, moment, ts

const log = logger('charts.flot')

interface FlotRenderContext {
  plot: any
  item: Chart
  query: Query
  renderer: charts.ChartRenderer
}

/* =============================================================================
   Helpers
   ============================================================================= */

const FORMAT_STRING_STANDARD = ',.3s'
const FORMAT_STANDARD = d3.format(FORMAT_STRING_STANDARD)
const FORMAT_PERCENT  = d3.format('%')
const THREE_HOURS_MS  = 1000 * 60 * 60 * 3
const ONE_HOUR_MS     = 1000 * 60 * 60 * 1

function is_line_chart(item: Chart) : boolean {
  return (item instanceof StandardTimeSeries)
    || ((item instanceof StackedAreaChart)
        && ((<StackedAreaChart>item).stack_mode === charts.StackMode.NONE))
}

function is_area_chart(item: Chart) : boolean {
  return (item instanceof StackedAreaChart)
    && ((<StackedAreaChart>item).stack_mode !== charts.StackMode.NONE)
    && ((<StackedAreaChart>item).stack_mode !== charts.StackMode.PERCENT)
}

function get_default_options() {
  let theme_colors = get_colors()
  let default_options = {
    colors: get_palette(),
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
            return moment(value).tz(app.config.DISPLAY_TIMEZONE).format('YYYY')
          if (axis.tickSize[1] === 'month' && axis.tickSize[0] >= 1 || axis.tickSize[1] === 'year')
            return moment(value).tz(app.config.DISPLAY_TIMEZONE).format('MM-\'YY')
          if (axis.tickSize[1] === 'day' && axis.tickSize[0] >= 1 || axis.tickSize[1] === 'month')
            return moment(value).tz(app.config.DISPLAY_TIMEZONE).format('MM/DD')
          if (axis.tickSize[1] === 'hour' && axis.tickSize[0] >= 12)
            return moment(value).tz(app.config.DISPLAY_TIMEZONE).format('MM/DD hA')
        }
        return moment(value).tz(app.config.DISPLAY_TIMEZONE).format('h:mm A')
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

function log_transform(v) {
  return v === 0
    ? v
    : (Math.log1p(Math.abs(v)) / Math.LN10)
}

function get_flot_options(item, base) {
  let options      = item.options || {}
  let flot_options = extend(true, {}, get_default_options(), base)

  flot_options.colors = get_palette(options.palette)

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

  if (options.y1 && options.y1.scale === AxisScale.LOG) {
    flot_options.yaxes[0].transform = log_transform
  }
  if (options.y2 && options.y2.scale === AxisScale.LOG) {
    flot_options.yaxes[1].transform = log_transform
  }

  if (item.show_max_value || item.show_min_value || item.show_last_value) {
    flot_options.series.valueLabels = {
      show: true,
      showMaxValue: item.show_max_value,
      showMinValue: item.show_min_value,
      showLastValue: item.show_last_value,
      showAsHtml: true,
      labelFormatter: FORMAT_STANDARD,
      yoffset: -20
    }
  }

  return flot_options
}

function show_tooltip(x, y, contents, offset?) {
  $('<div id="ds-tooltip">' + contents + '</div>').css( {
    position: 'absolute',
    display: 'none',
    top: y + (offset || 5),
    left: x + (offset || 5)
  }).appendTo("body").show()
}

function setup_plugins(container, context: FlotRenderContext) {

  $(container).bind("multihighlighted", function(event, pos, items) {
    if ( !items )
      return
    let is_percent = context.item['stack_mode'] && (context.item['stack_mode'] === charts.StackMode.PERCENT)
    let data       = context.plot.getData()
    let item       = items[0]
    let point      = data[item.serieIndex].data[item.dataIndex]

    let items_to_plot = items.map((i) => {
      let s = data[i.serieIndex]
      if (context.item.hide_zero_series && s.summation.sum === 0)
        return null
      let value = is_percent
        ? s.percents[i.dataIndex]
        : s.data[i.dataIndex][1]
      return {
        series: s,
        value: is_percent ? FORMAT_PERCENT(value) : FORMAT_STANDARD(value)
      }
    }).filter(i => !!i)


    if (context.item['stack_mode'] && (context.item['stack_mode'] !== charts.StackMode.NONE))
        items_to_plot.reverse()

    let contents = ts.templates.flot.tooltip({
      time: point[0],
      items: items_to_plot
    })

    $("#ds-tooltip").remove()
    show_tooltip(pos.pageX, pos.pageY, contents)
  })

  if (context.item instanceof XYChart) {
    $(container).bind('plothover', (e, pos, event_item) => {
      if (event_item) {
        context.renderer.highlight_series(context.item, event_item.seriesIndex)
      } else {
        context.renderer.unhighlight_series(context.item)
      }
    })
  }

  $(container).bind("unmultihighlighted", function(event) {
    $("#ds-tooltip").remove()
  })
}

/* =============================================================================
   Chart renderer interface
   ============================================================================= */

export default class FlotChartRenderer extends charts.ChartRenderer {

  downsample: boolean = true
  downsampling_factor: number = 0.8
  connected_lines: boolean = false

  constructor(data?: any) {
    super(extend({}, data, {
      name:          'flot',
      is_interactive: true,
      description: 'flot renders interactive charts using HTML canvas.'
    }))
    if (data) {
      if (typeof(data.downsample) !== 'undefined') {
        this.downsample = !!data.downsample
      }
      if (typeof(data.connected_lines) !== 'undefined') {
        this.connected_lines = !!data.connected_lines
      }
      this.downsampling_factor = data.downsampling_factor || this.downsampling_factor
    }
  }

  sparkline(e: any, query: Query, index: number, opt?: any) {
    let data = [query.chart_data('flot')[index]]
    let options = extend(true, {}, {
      colors: get_palette(),
      series: {
        lines: {
          show: true,
          lineWidth: 1,
          fill: 0.4
        }
      },
      grid: { show: false },
      legend: { show: false },
      shadowSize: 0,
      downsample: true
    }, opt)
    return {
      plot: $.plot(e, data, options),
      query: query,
      index: index,
      renderer: this
    }
  }

  render(e: any, item: Chart, query: Query, options?: any, data?: any) : any {
    if (typeof(data) === 'undefined')
      data = query.chart_data('flot')
    let context : FlotRenderContext = {
      plot: null,
      item: item,
      query: query,
      renderer: this
    }
    setup_plugins(e, context)
    if (this.downsample && options.downsample) {
      options.series.downsample = {
        threshold: Math.floor(e.width() * this.downsampling_factor)
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
    item.render_context = context
    options.interactive_legend = true
    render_legend(item, query, options)
    return context
  }

  highlight_series(item: Chart, index: number) : void {
    let plot = item.render_context.plot
    if (is_line_chart(item)) {
      plot.getData().forEach((s, i) => {
        if (i == index) {
          s.lines.lineWidth = 3
          s.highlighted = true
        } else {
          s.lines.lineWidth = 1
          s.highlighted = false
        }
      })
    } else if (is_area_chart(item)) {
      plot.getData().forEach((s, i) => {
        if (i != index) {
          s.lines.fill = 0.2
          s.lines.lineWidth = 0
          s.highlighted = false
        } else {
          s.highlighted = true
          s.lines.fill = 1.0
          s.lines.lineWidth = 1
        }
      })
    }
    plot.draw()
  }

  unhighlight_series(item: Chart, index?: number) : void {
    let plot = item.render_context.plot
    if (is_line_chart(item)) {
      if (index) {
        plot.getData()[index].lines.lineWidth = 1
      } else {
        plot.getData().forEach((s, i) => {
          s.lines.lineWidth = 1
        })
      }
    } else if (is_area_chart(item)) {
      plot.getData().forEach((s, i) => {
        s.lines.fill = 1.0
        s.lines.lineWidth = 1
      })
    }
    plot.draw()
  }

  process_series(series: graphite.DataSeries) : any {
    let result : any = {}
    if (series.summation) {
      result.summation = series.summation
    }
    result.label = series.target
    result.data = series.datapoints.map(function(point) {
      return [point[1] * 1000, point[0]]
    })
    if (this.connected_lines) {
      result.data = result.data.filter(function(point) {
        return point[1] != null
      })
    }
    return result
  }

  simple_line_chart(element: any, item: Chart, query: Query) : void {
    let options = get_flot_options(item, {
      grid: { show: false },
      downsample: true
    })

    return this.render(element, item, query, options, [query.chart_data('flot')[0]])
  }

  standard_line_chart(element: any, item: Chart, query: Query) : void {
    query.chart_data('flot').forEach(function(series) {
      if (series.summation.sum === 0) {
        series.lines = {
          lineWidth: 0
        }
      }
    })
    this.render(element, item, query, get_flot_options(item, {
      downsample: true
    }))
  }

  simple_area_chart(element: any, item: Chart, query: Query) : void {
    let options = get_flot_options(item, {
      downsample: true,
      grid: { show: false },
      series: {
        lines: { fill: 1.0 },
        grid: { show: false }
      }
    })

    return this.render(element, item, query, options, [query.chart_data('flot')[0]])
  }

  stacked_area_chart(element: any, item: Chart, query: Query) : void {
    let options = get_flot_options(item, {
      downsample: true,
      series: {
        lines: {
          fill: 1
        },
        stackD3: {
          show: true,
          offset: 'zero'
        }
      }
    })

    if (item['stack_mode']) {
      let mode = item['stack_mode']
      if (mode === charts.StackMode.PERCENT) {
        options.series.stackD3.offset = 'expand'
        options.yaxes[0].max = 1
        options.yaxes[0].min = 0
        options.yaxes[0].tickFormatter = FORMAT_PERCENT
      } else if (mode == charts.StackMode.STREAM) {
        options.series.stackD3.offset = 'wiggle'
      } else if (mode == charts.StackMode.NONE) {
        options.series.stackD3.show = false
        options.series.lines.fill = false
      }
    }

    query.chart_data('flot').forEach(function(series) {
      if (series.summation.sum === 0) {
        series.lines = {
          lineWidth: 0
        }
      }
    })

    return this.render(element, item, query, options)
  }

  donut_chart(element: any, item: Chart, query: Query) {
    let options = get_flot_options(item, {
      crosshair: { mode: null },
      multihighlight: { mode: null },
      series: {
        lines: { show: false },
        pie: {
          show: true,
          radius: 'auto',
          innerRadius: item['is_pie'] ? 0 : 0.35,
          label: { show: item['labels'] },
          highlight: {
            opacity: 0
          }
        }
      },
      grid: { show: false, hoverable: true }
    })

    let transform = item['transform'] || 'sum'
    let data = query.chart_data('flot').map(function(series) {
       if (item.hide_zero_series && series.summation.sum === 0) {
         return undefined
       }
      return {
        label: series.label,
        summation: series.summation,
        data: [ series.label, series.summation[transform] ]
      }
    }).filter(function(item) { return item })

    let context = this.render(element, item, query, options, data)

    $(element).bind('plothover', function(event, pos, event_item) {
      if (event_item) {
        let contents = ts.templates.flot.donut_tooltip({
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

    return context
  }

  bar_chart(element: any, item: Chart, query: Query) : void {
    let series      = query.chart_data('flot')[0]
    let ts_start    = series.data[0][0]
    let ts_end      = series.data[series.data.length - 1][0]
    let ts_length   = ts_end - ts_start
    let sample_size = ts_length / series.data.length

    let bar_scaling = 0.85
    if (ts_length > THREE_HOURS_MS) {
      bar_scaling = 0.15
    } else if (ts_length > ONE_HOUR_MS) {
      bar_scaling = 0.65
    } else {
      bar_scaling = 0.85
    }

    let options = get_flot_options(item, {
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
    if (item['stack_mode']) {
      let mode = item['stack_mode']
      if (mode === charts.StackMode.PERCENT) {
        options.series.stackD3.offset = 'expand'
        options.yaxes[0].max = 1
        options.yaxes[0].min = 0
        options.yaxes[0].tickFormatter = FORMAT_PERCENT
      } else if (mode == charts.StackMode.STREAM) {
        options.series.stackD3.offset = 'wiggle'
      } else if (mode == charts.StackMode.NONE) {
        options.series.stackD3.show = false
        options.series.lines.fill = false
      }
    }

    return this.render(element, item, query, options)
  }

  discrete_bar_chart(element: any, item: Chart, query: Query) : void {
    let is_horizontal = item['orientation'] === 'horizontal'
    let format = d3.format(item['format'] || FORMAT_STRING_STANDARD)
    let options = get_flot_options(item, {
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
            show: item['show_numbers'],
            font: '10pt Helvetica',
            fontColor: '#f9f9f9', // TODO: get from theme
            formatter: format,
            yAlign: function(y) { return y },
            xAlign: function(x) { return x }
          }
        }
      }
    })

    let transform = item['transform'] || 'sum'
    let index = 0
    let data = query.chart_data('flot').map(function(series) {
      if (item.hide_zero_series && series.summation.sum === 0) {
         return undefined
      }
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
    let ticks = data.map(function(series) {
      return [index++, series.label]
    })

    if (is_horizontal) {
      options.yaxes[0].tickLength = 0
      options.yaxes[0].ticks = ticks
      options.xaxis.tickFormatter = null
      options.series.bars.numbers.xOffset = -18
      if (item['show_grid']) {
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
      if (!item['show_grid']) {
        options.yaxes[0].ticks = []
        options.yaxes[0].axisLabel = null
      } else {
        options.xaxis.axisLabel = transform.charAt(0).toUpperCase() + transform.substring(1)
      }
    }

    let context = this.render(element, item, query, options, data)
    $(element).bind('plothover', function(event, pos, event_item) {
      if (event_item) {
        let contents = ts.templates.flot.discrete_bar_tooltip({
          series: event_item.series,
          value: format(event_item.datapoint[1])
        })
        $("#ds-tooltip").remove()
        show_tooltip(pos.pageX, pos.pageY, contents)
      } else {
        $("#ds-tooltip").remove()
      }
    })
    return context
  }
}
