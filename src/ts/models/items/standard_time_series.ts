import XYChart from './xychart'
import Query from '../data/query'
import { DashboardItemMetadata } from './item'
import * as charts from '../../charts/core'

declare var $

export default class StandardTimeSeries extends XYChart {
  static meta: DashboardItemMetadata = {
    icon: 'fa fa-line-chart'
  }

  constructor(data?: any) {
    super(data)
  }

  data_handler(query: Query) : void {
    charts.standard_line_chart($(`#${this.item_id} .ds-graph-holder`), this, query)
  }
}
