import XYChart from './xychart'
import Query from '../data/query'
import { DashboardItemMetadata } from './item'
import * as charts from '../../charts/core'
import { extend } from '../../core/util'
import { PropertyList } from '../../core/property'

declare var $

export default class StackedAreaChart extends XYChart {
  static meta: DashboardItemMetadata = {
    icon: 'fa fa-area-chart'
  }

  stack_mode: string = charts.StackMode.NORMAL

  constructor(data?: any) {
    super(data)
    if (data) {
      this.stack_mode = data.stack_mode || this.stack_mode
    }
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      stack_mode: this.stack_mode
    })
  }

  data_handler(query: Query) : void {
    charts.stacked_area_chart($(`#${this.item_id} .ds-graph-holder`), this, query)
  }

  interactive_properties() : PropertyList {
    return super.interactive_properties().concat([
      {
        name: 'stack_mode',
        type: 'select',
        edit_options: {
          source: [
            charts.StackMode.NONE,
            charts.StackMode.NORMAL,
            charts.StackMode.PERCENT,
            charts.StackMode.STREAM
          ]
        }
      }
    ])
  }
}
