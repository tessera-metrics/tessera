import Query from '../models/data/query'
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

export function simple_line_chart(element: any, item: Chart) : void {
  if (renderer) {
    renderer.simple_line_chart(element, item)
  }
}

export function standard_line_chart(element: any, item: Chart) : void {
  if (renderer) {
    renderer.standard_line_chart(element, item)
  }
}

export function simple_area_chart(element: any, item: Chart) : void {
  if (renderer) {
    renderer.simple_area_chart(element, item)
  }
}

export function stacked_area_chart(element: any, item: Chart) : void {
  if (renderer) {
    renderer.stacked_area_chart(element, item)
  }
}

export function donut_chart(element: any, item: Chart) : void {
  if (renderer) {
    renderer.donut_chart(element, item)
  }
}

export function bar_chart(element: any, item: Chart) : void {
  if (renderer) {
    renderer.bar_chart(element, item)
  }
}

export function discrete_bar_chart(element: any, item: Chart) : void {
  if (renderer) {
    renderer.discrete_bar_chart(element, item)
  }
}
