import Chart from './chart'
import Query from '../data/query'
import { DashboardItemMetadata } from './item'
import { register_dashboard_item } from './factory'
import * as charts from '../../charts/core'

declare var $

export default class StandardTimeSeries extends Chart {
  static meta: DashboardItemMetadata = {
    icon: 'fa fa-line-chart'
  }

  constructor(data?: any) {
    super(data)
  }

  data_handler(query: Query) : void {
    charts.standard_line_chart($(`#${this.item_id} .ds-graph-holder`), this)
  }
}
register_dashboard_item(StandardTimeSeries)
