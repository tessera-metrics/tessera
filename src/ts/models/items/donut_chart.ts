import Chart from './chart'
import Query from '../data/query'
import { DashboardItemMetadata } from './item'
import { register_dashboard_item } from './factory'
import * as charts from '../../charts/core'
import { extend } from '../../core/util'
import { PropertyList } from '../../core/property'

declare var $

export default class DonutChart extends Chart {
  static meta: DashboardItemMetadata = {
    icon: 'fa fa-pie-chart'
  }

  labels: boolean = false
  is_pie: boolean = false

  constructor(data?: any) {
    super(data)
    if (data) {
      if (typeof(data.labels) !== 'undefined') {
        this.labels = Boolean(data.labels)
      }
      if (typeof(data.is_pie) !== 'undefined') {
        this.is_pie = Boolean(data.is_pie)
      }
    }
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      labels: this.labels,
      is_pie: this.is_pie
    })
  }

  data_handler(query: Query) : void {
    charts.donut_chart($("#" + this.item_id + ' .ds-graph-holder'), this)
  }

  interactive_properties(): PropertyList {
    return super.interactive_properties().concat([
      { name: 'labels', type: 'boolean' },
      { name: 'is_pie', type: 'boolean' }
    ])
  }
}
register_dashboard_item(DonutChart)
