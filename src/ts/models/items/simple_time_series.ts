import Chart from './chart'
import Query from '../data/query'
import { DashboardItemMetadata } from './item'
import { PropertyList } from '../../core/property'
import { extend } from '../../core/util'
import { register_dashboard_item } from './factory'
import * as charts from '../../charts/core'

declare var $

export default class SimpleTimeSeries extends Chart {
  static meta: DashboardItemMetadata = {
    icon: 'fa fa-line-chart'
  }

  filled: boolean = false
  show_max_value: boolean = false
  show_min_value: boolean = false
  show_last_value: boolean = false

  constructor(data?: any) {
    super(data)
    if (data) {
      this.legend = data.legend
      this.filled = !!data.filled
      this.show_max_value  = !!data.show_max_value
      this.show_min_value  = !!data.show_min_value
      this.show_last_value = !!data.show_last_value
      if (!this.height) {
        this.height = 1
      }
    }
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      filled: this.filled,
      show_max_value: this.show_max_value,
      show_min_value: this.show_min_value,
      show_last_value: this.show_last_value
    })
  }

  data_handler(query: Query) : void {
    let selector = `#${this.item_id} .ds-graph-holder`
    if (this.filled) {
      charts.simple_area_chart($(selector), this)
    } else {
      charts.simple_line_chart($(selector), this)
    }
  }

  interactive_properties() : PropertyList {
    return super.interactive_properties().concat([
      { name: 'filled', type: 'boolean' },
      { name: 'show_max_value', type: 'boolean' },
      { name: 'show_min_value', type: 'boolean' },
      { name: 'show_last_value', type: 'boolean' }
    ])
  }
}
register_dashboard_item(SimpleTimeSeries)
