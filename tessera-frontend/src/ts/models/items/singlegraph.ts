import Chart from './chart'
import Query from '../data/query'
import { DashboardItemMetadata } from './item'
import * as charts from '../../charts'
import { extend } from '../../util'
import { PropertyList } from '../../core/property'

declare var $, d3

export default class Singlegraph extends Chart {
  static meta: DashboardItemMetadata = {
    icon: 'fa fa-image',
    category: 'chart',
    requires_data: true
  }

  format: string = ',.1s'
  transform: string = 'mean'
  index: number

  constructor(data?: any) {
    super(data)
    if (data) {
      this.format = data.format || this.format
      this.transform = data.transform || this.transform
      this.index = data.index
      if (!this.height)
        this.height = 1
    }
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      format: this.format,
      transform: this.transform,
      index: this.index
    })
  }

  data_handler(query: Query) : void {
    if (!query.data)
      return
    let flot = <charts.FlotChartRenderer>charts.renderers.get('flot')
    let options = {
      colors: charts.get_palette(this.options.palette)
    }
    flot.sparkline(`#${this.item_id} .ds-graph-holder`, this, query, 0, options)
    this.options.margin = { top: 0, left: 0, bottom: 0, right: 0 }
    var label = query.data[this.index || 0].target
    var value = query.summation[this.transform]
    if (this.index) {
      value = query.data[this.index].summation[this.transform]
    }
    $(`#${this.item_id} span.value`).text(d3.format(this.format)(value))
    $(`#${this.item_id} span.ds-label`).text(label)
  }

  interactive_properties(): PropertyList {
    return super.interactive_properties().concat([
      'format', 'transform'
    ])
  }
}
