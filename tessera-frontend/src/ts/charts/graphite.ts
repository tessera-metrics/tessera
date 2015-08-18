import * as charts from './core'
import { AxisScale } from '../models/axis'
import Chart from '../models/items/chart'
import Query from '../models/data/query'
import { get_colors, get_palette } from './util'
import { extend } from '../core/util'
import { render_legend } from './legend'

declare var URI, $

function img(element, url) : void {
  element.html($('<img/>')
               .attr('src', url.setQuery('cachebuster', new Date().getTime()).href())
               .height(element.height())
               .width(element.width()))
}

function set_scale(url, options) {
    if (options.y1 && options.y1.scale) {
      switch (options.y1.scale) {
      case AxisScale.LOG:
        url.setQuery('logBase', 10 )
        break;
      }
    }
}


/**
 * Charts provider for Graphite's built-in static image
 * rendering. Also provides Graphite URL formatting for a number of
 * the UI's actions (Open in Graphite..., Export PNG..., etc...)
 */
export default class GraphiteChartRenderer extends charts.ChartRenderer {

  static DEFAULT_BGCOLOR = 'ff000000'

  graphite_url: string
  connected_lines: boolean = false

  constructor(data?: any) {
    super(extend({}, data, {
      name: 'graphite',
      is_interactive: false,
      description: "Render graphs using Graphite's built-in static PNG rendering. "
        + "No interactive features will be available with this option, "
        + "and not all chart types will render with fidelity."
    }))
    if (data) {
      this.graphite_url = data.graphite_url
      this.connected_lines = !!data.connected_lines
    }
  }

  simple_line_chart(element: any, item: Chart, query: Query) : void {
    let url = this.simple_line_chart_url(item, query, {
      height: element.height(),
      width: element.width()
    })
    img(element, url)
  }

  simple_line_chart_url(item: Chart, query: Query, opt?: any) : any {
    let options = extend({}, opt, item.options, get_colors())
    let png_url = new URI(query.url({ base_url: this.graphite_url }))
      .setQuery('format', options.format || 'png')
      .setQuery('height', options.height || 600)
      .setQuery('width', options.width || 1200)
      .setQuery('bgcolor', options.bgcolor || GraphiteChartRenderer.DEFAULT_BGCOLOR)
      .setQuery('fgcolor', options.fgcolor || 'white')
      .setQuery('hideLegend', 'true')
      .setQuery('hideAxes', 'true')
      .setQuery('margin', '0')
      .setQuery('colorList', get_palette(options.palette).join())
      .setQuery('title', options.showTitle ? item.title : '')

    if (this.connected_lines) {
      png_url.setQuery('lineMode', 'connected')
    }

    if (options.y1 && options.y1.min) {
      png_url.setQuery('yMin', options.y1.min )
    }
    if (options.y1 && options.y1.max) {
      png_url.setQuery('yMax', options.y1.max )
    }
    set_scale(png_url, options)

    return png_url
  }

  standard_line_chart(element: any, item: Chart, query: Query) : void {
    let url = this.standard_line_chart_url(item, query, {
      height: element.height(),
      width: element.width()
    })
    img(element, url)
    render_legend(item, query)
  }

  standard_line_chart_url(item: Chart, query: Query, opt) : any {
    let options = extend({}, opt, item.options, get_colors())
    let png_url = new URI(query.url({ base_url: this.graphite_url }))
      .setQuery('format', options.format || 'png')
      .setQuery('height', options.height || 600)
      .setQuery('width', options.width || 1200)
      .setQuery('bgcolor', options.bgcolor || GraphiteChartRenderer.DEFAULT_BGCOLOR)
      .setQuery('fgcolor', options.fgcolor || 'black')
      .setQuery('majorGridLineColor', options.majorGridLineColor || '#dddddd')
      .setQuery('minorGridLineColor', options.minorGridLineColor || '#eeeeee')
      .setQuery('hideLegend', 'true')
      .setQuery('hideAxes', options.hideAxes || 'false')
      .setQuery('colorList', get_palette(options.palette).join())
      .setQuery('vtitle', options.y1 ? options.y1.label : options.yAxisLabel)
      .setQuery('title', options.showTitle ? item.title : '')
      .setQuery('lineMode', 'connected')

    if (options.y1 && options.y1.min) {
      png_url.setQuery('yMin', options.y1.min )
    }
    if (options.y1 && options.y1.max) {
      png_url.setQuery('yMax', options.y1.max )
    }
    set_scale(png_url, options)

    return png_url
  }

  simple_area_chart(element: any, item: Chart, query: Query) : void {
    let url = this.simple_area_chart_url(item, query, {
      height: element.height(),
      width: element.width()
    })
    img(element, url)
  }

  simple_area_chart_url(item: Chart, query: Query, opt?: any) : any {
    let options = extend({}, opt, item.options, get_colors())
    let png_url = new URI(query.url({ base_url: this.graphite_url }))
      .setQuery('format', options.format || 'png')
      .setQuery('height', options.height || 600)
      .setQuery('width', options.width || 1200)
      .setQuery('bgcolor', options.bgcolor || GraphiteChartRenderer.DEFAULT_BGCOLOR)
      .setQuery('fgcolor', options.fgcolor || 'black')
      .setQuery('majorGridLineColor', options.majorGridLineColor || '#dddddd')
      .setQuery('minorGridLineColor', options.minorGridLineColor || '#eeeeee')
      .setQuery('hideLegend', 'true')
      .setQuery('hideAxes', 'true')
      .setQuery('margin', '0')
      .setQuery('colorList', get_palette(options.palette).join())
      .setQuery('lineMode', 'connected')

    if (!query.is_stacked()) {
      png_url.setQuery('areaMode', 'stacked')
    }

    if (options.y1 && options.y1.min) {
      png_url.setQuery('yMin', options.y1.min )
    }
    if (options.y1 && options.y1.max) {
      png_url.setQuery('yMax', options.y1.max )
    }
    set_scale(png_url, options)

    return png_url
  }

  stacked_area_chart(element: any, item: Chart, query: Query) : void {
    let url = this.stacked_area_chart_url(item, query, {
      height: element.height(),
      width: element.width()
    })
    img(element, url)
    render_legend(item, query)
  }

  stacked_area_chart_url(item: Chart, query: Query, opt?: any) {
    let options = extend({}, opt, item.options, get_colors())
    let png_url = new URI(query.url({ base_url: this.graphite_url }))
      .setQuery('format', options.format || 'png')
      .setQuery('height', options.height || 600)
      .setQuery('width', options.width || 1200)
      .setQuery('bgcolor', options.bgcolor || GraphiteChartRenderer.DEFAULT_BGCOLOR)
      .setQuery('fgcolor', options.fgcolor || 'black')
      .setQuery('majorGridLineColor', options.majorGridLineColor || '#dddddd')
      .setQuery('minorGridLineColor', options.minorGridLineColor || '#eeeeee')
      .setQuery('hideLegend', 'true')
      .setQuery('hideAxes', options.hideAxes || 'false')
      .setQuery('colorList', get_palette(options.palette).join())
      .setQuery('vtitle', options.y1 ? options.y1.label : options.yAxisLabel)
      .setQuery('title', options.showTitle ? item.title : '')
      .setQuery('lineMode', 'connected')

    if (item.hasOwnProperty('stack_mode')) {
      if (!query.is_stacked() && item['stack_mode'] != charts.StackMode.NONE) {
        png_url.setQuery('areaMode', 'stacked')
      }
    }

    if (options.y1 && options.y1.min) {
      png_url.setQuery('yMin', options.y1.min )
    }
    if (options.y1 && options.y1.max) {
      png_url.setQuery('yMax', options.y1.max )
    }
    set_scale(png_url, options)

    return png_url
  }

  donut_chart_url(item: Chart, query: Query, opt?: any) : any {
    let png_url = this.standard_line_chart_url(item, query, opt)
      .setQuery('graphType', 'pie')
      .setQuery('hideLegend', 'true')
    return png_url
  }

  donut_chart(element: any, item: Chart, query: Query) : void {
    let url = this.donut_chart_url(item, query, {
      height: element.height(),
      width: element.width()
    })
    img(element, url)
    render_legend(item, query)
  }

  bar_chart(element: any, item: Chart, query: Query) : void{
    this.stacked_area_chart(element, item, query)
  }

  discrete_bar_chart(element: any, item: Chart, query: Query) : void {
    this.donut_chart(element, item, query)
  }

  chart_url(item: Chart, query: Query, opt?: any) {
    switch (item.item_type) {
    case 'simple_time_series':
      return item['filled']
        ? this.simple_area_chart_url(item, query, opt)
        : this.simple_line_chart_url(item, query, opt)
    case 'standard_time_series':
      return this.standard_line_chart_url(item, query, opt)
    case 'stacked_area_chart':
      return this.stacked_area_chart_url(item, query, opt)
    case 'singlegraph':
      return this.simple_area_chart_url(item, query, opt)
    case 'donut_chart':
      return this.donut_chart_url(item, query, opt)
    }
    return undefined
  }

  composer_url(item: Chart, query: Query, opt?: any) {
    let options = opt || {}
    let composer_url = new URI(query.url({ base_url: this.graphite_url }))
      .filename('composer')
      .removeQuery('format')
      .setQuery('colorList', get_palette(options.palette).join())
      .setQuery('vtitle', options.yAxisLabel)
      .setQuery('title', options.showTitle ? item.title : '')
    if (item.item_type === 'stacked_area_chart' && !(query.is_stacked())) {
      composer_url.setQuery('areaMode', 'stacked')
    }
    return composer_url
  }
}

export function composer_url(item: Chart, query: Query, options?: any) {
  let g = <GraphiteChartRenderer> charts.renderers.get('graphite')
  return g.composer_url(item, query, options)
}

export function chart_url(item: Chart, query: Query, options?: any) {
  let g = <GraphiteChartRenderer> charts.renderers.get('graphite')
  return g.chart_url(item, query, options)
}
