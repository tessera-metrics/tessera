import { logger } from '../util'
import Chart from '../models/items/chart'
import DashboardItem from '../models/items/item'
import Query from '../models/data/query'
import { NamedObject, Registry } from '../util'
import * as graphite from '../data/graphite'

export const DEFAULT_PALETTE = 'spectrum6'
const log = logger('charts')

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

  simple_line_chart(selector: string, item: Chart, query: Query) : void {}
  standard_line_chart(selector: string, item: Chart, query: Query) : void {}
  simple_area_chart(selector: string, item: Chart, query: Query) : void {}
  stacked_area_chart(selector: string, item: Chart, query: Query) : void {}
  donut_chart(selector: string, item: Chart, query: Query) : void {}
  bar_chart(selector: string, item: Chart, query: Query) : void {}
  discrete_bar_chart(selector: string, item: Chart, query: Query) : void {}
  highlight_series(item: Chart, index: number) : void {}
  unhighlight_series(item: Chart, index?: number) : void {}
  cleanup(item: Chart) : void {}

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
  log.debug(`set_renderer(): ${r}`)
  if (typeof r === 'string') {
    let _renderer = renderers.get(r)
    if (!_renderer) {
      log.error(`Unknown renderer ${r}`)
    } else {
      renderer = _renderer
    }
  } else {
    renderer = r
  }
}

/* =============================================================================
   Global delegates
   ============================================================================= */

export function get_renderer(item?: DashboardItem|string) : ChartRenderer {
  if (!item) {
    return renderer
  }
  let name = undefined
  if (typeof item === 'string') {
    name = item
  } else {
    name = item['renderer']
  }
  if (item instanceof DashboardItem) {
    if (!name && item.dashboard && item.dashboard.definition) {
      name = item.dashboard.definition.renderer
    }
  }
  return renderers.get(name) || renderer
}

export function simple_line_chart(selector: string, item: Chart, query: Query) : void {
  let r = get_renderer(item)
  if (r) {
    r.simple_line_chart(selector, item, query)
  }
}

export function standard_line_chart(selector: string, item: Chart, query: Query) : void {
  let r = get_renderer(item)
  if (r) {
    r.standard_line_chart(selector, item, query)
  }
}

export function simple_area_chart(selector: string, item: Chart, query: Query) : void {
  let r = get_renderer(item)
  if (r) {
    r.simple_area_chart(selector, item, query)
  }
}

export function stacked_area_chart(selector: string, item: Chart, query: Query) : void {
  let r = get_renderer(item)
  if (r) {
    r.stacked_area_chart(selector, item, query)
  }
}

export function donut_chart(selector: string, item: Chart, query: Query) : void {
  let r = get_renderer(item)
  if (r) {
    r.donut_chart(selector, item, query)
  }
}

export function bar_chart(selector: string, item: Chart, query: Query) : void {
  let r = get_renderer(item)
  if (r) {
    r.bar_chart(selector, item, query)
  }
}

export function discrete_bar_chart(selector: string, item: Chart, query: Query) : void {
  let r = get_renderer(item)
  if (r) {
    r.discrete_bar_chart(selector, item, query)
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

export function cleanup(item: Chart) : void {
  let r = get_renderer(item)
  if (r) {
    r.cleanup(item)
  }
}
