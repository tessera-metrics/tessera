import Chart from './chart'
import Query from '../data/query'
import { DashboardItemMetadata } from './item'
import { register_dashboard_item } from './factory'
import * as charts from '../../charts/core'
import { extend } from '../../core/util'
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
    charts.simple_area_chart($("#" + this.item_id + ' .ds-graph-holder'), this)
    this.options.margin = { top: 0, left: 0, bottom: 0, right: 0 }
    var label = this.query.data[this.index || 0].key
    var value = this.query.summation[this.transform]
    if (this.index) {
      value = this.query.data[this.index].summation[this.transform]
    }
    $('#' + this.item_id + ' span.value').text(d3.format(this.format)(value))
    $('#' + this.item_id + ' span.ds-label').text(label)
  }

  interactive_properties(): PropertyList {
    return super.interactive_properties().concat([
      'format', 'transform'
    ])
  }
}
register_dashboard_item(Singlegraph)
