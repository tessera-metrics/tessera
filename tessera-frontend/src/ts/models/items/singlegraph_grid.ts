import Chart from './chart'
import Query from '../data/query'
import { DashboardItemMetadata } from './item'
import * as charts from '../../charts'
import { extend } from '../../util'
import { PropertyList } from '../../core/property'

declare var $, d3, ts

export default class SinglegraphGrid extends Chart {
  static meta: DashboardItemMetadata = {
    icon: 'fa fa-image',
    category: 'chart',
    requires_data: true
  }

  format: string = ',.1s'
  transform: string = 'mean'
  columns: number = 4

  constructor(data?: any) {
    super(data)
    if (data) {
      this.format = data.format || this.format
      this.transform = data.transform || this.transform
      this.columns = data.columns || this.columns
    }
    if (!this.height)
      this.height = 1
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      format: this.format,
      transform: this.transform,
      columns: this.columns
    })
  }

  data_handler(query: Query) : void {
    if (!query.data)
      return
    let span   = 12 / this.columns
    let format = d3.format(this.format)
    let flot   = <charts.FlotChartRenderer>charts.renderers.get('flot')
    let holder = $(`#${this.item_id} .ds-singlegraph-grid-holder`)
    let options = {
      colors: charts.get_palette(this.options.palette)
    }
    holder.empty()
    query.data.forEach((series, i) => {
      let value = series.summation[this.transform]
      holder.append(ts.templates.models.singlegraph_grid_item({
        item: this,
        index: i,
        colspan: span,
        value: format(value),
        label: series.target
      }))
      flot.sparkline(`#${this.item_id}-${i} .ds-graph-holder`, this, query, i, options)
    })
  }

  interactive_properties(): PropertyList {
    return super.interactive_properties().concat([
      'format', 'transform',
      {
        name: 'columns',
        edit_options: {
          type: 'select',
          source: [ 1, 2, 3, 4, 6, 12 ]
        }
      },

    ])
  }
}
