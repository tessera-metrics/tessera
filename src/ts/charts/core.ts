import Chart from '../models/items/chart'
import { NamedObject, Registry } from '../core/registry'
import * as graphite from '../data/graphite'

export const DEFAULT_PALETTE = 'spectrum6'

export const StackMode = {
  NONE:    'none',
  NORMAL:  'stack',
  PERCENT: 'percent',
  STREAM:  'stream'
}

export class ChartRenderer implements NamedObject {
  name: string
  is_interactive: boolean
  description: string

  constructor(data?: any) {
    if (data) {
      this.name = data.name
      this.is_interactive = !!data.is_interactive
      this.description = data.description
    }
  }

  simple_line_chart(element: any, item: Chart) : void {}
  standard_line_chart(element: any, item: Chart) : void {}
  simple_area_chart(element: any, item: Chart) : void {}
  stacked_area_chart(element: any, item: Chart) : void {}
  donut_chart(element: any, item: Chart) : void {}
  bar_chart(element: any, item: Chart) : void {}
  discrete_bar_chart(element: any, item: Chart) : void {}

  process_series(series: graphite.DataSeries) : any {
    return series
  }

  process_data(data: graphite.DataSeriesList|graphite.DataSeries) : any {
    if (!data) {
      return []
    }
    if (data instanceof Array) {
      return data.map(series => this.process_series(series))
    } else {
      return [this.process_series(<graphite.DataSeries>data)]
    }
  }
}

export var renderers = new Registry<ChartRenderer>({
  name: 'chart-renderers'
})

export var renderer : ChartRenderer

export function set_renderer(r: string|ChartRenderer) {
  if (typeof r === 'string') {
    renderer = renderers.get(r)
  } else {
    renderer = r
  }
}

/* =============================================================================
   Global delegates
   ============================================================================= */

export function get_renderer(item: Chart|string) : ChartRenderer {
  let name = undefined
  if (typeof item === 'string') {
    name = item
  } else {
    name = item.renderer
  }
  return renderers.get(name) || renderer
}

export function simple_line_chart(element: any, item: Chart) : void {
  let r = get_renderer(item)
  if (r) {
    r.simple_line_chart(element, item)
  }
}

export function standard_line_chart(element: any, item: Chart) : void {
  let r = get_renderer(item)
  if (r) {
    r.standard_line_chart(element, item)
  }
}

export function simple_area_chart(element: any, item: Chart) : void {
  let r = get_renderer(item)
  if (r) {
    r.simple_area_chart(element, item)
  }
}

export function stacked_area_chart(element: any, item: Chart) : void {
  let r = get_renderer(item)
  if (r) {
    r.stacked_area_chart(element, item)
  }
}

export function donut_chart(element: any, item: Chart) : void {
  let r = get_renderer(item)
  if (r) {
    r.donut_chart(element, item)
  }
}

export function bar_chart(element: any, item: Chart) : void {
  let r = get_renderer(item)
  if (r) {
    r.bar_chart(element, item)
  }
}

export function discrete_bar_chart(element: any, item: Chart) : void {
  let r = get_renderer(item)
  if (r) {
    r.discrete_bar_chart(element, item)
  }
}

export function process_series(series: graphite.DataSeries, type?: string) : any {
  let r = get_renderer(type)
  return r ? r.process_series(series) : series
}

export function process_data(data: graphite.DataSeriesList|graphite.DataSeries, type?: string) : any {
  let r = get_renderer(type)
  return r ? r.process_data(data) : data
}
