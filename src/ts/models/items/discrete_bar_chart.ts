import Chart from './chart'
import Query from '../data/query'
import * as charts from '../../charts/core'
import { DashboardItemMetadata } from './item'
import { register_dashboard_item } from './factory'
import { extend } from '../../core/util'
import { PropertyList } from '../../core/property'

declare var $

export default class DiscreteBarChart extends Chart {
  static meta: DashboardItemMetadata = {
    display_name: 'Bar Chart (Discrete)',
    icon: 'fa fa-bar-chart'
  }

  transform: string = 'sum'
  orientation: string = 'vertical'
  format: string = ',.3s'
  show_grid: boolean = true
  show_numbers: boolean = true

  constructor(data?: any) {
    super(data)
    if (data) {
      this.legend = undefined
      this.transform = data.transform || this.transform
      this.orientation = data.orientation || this.orientation
      this.format = data.format || this.format
      if (typeof(data.show_grid) !== 'undefined') {
        this.show_grid = Boolean(data.show_grid)
      }
      if (typeof(data.show_numbers) !== 'undefined') {
        this.show_numbers = Boolean(data.show_numbers)
      }
    }
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      orientation: this.orientation,
      transform: this.transform,
      format: this.format,
      show_grid: this.show_grid,
      show_numbers: this.show_numbers
    })
  }

  data_handler(query: Query) : void {
    charts.discrete_bar_chart($('#' + this.item_id + ' .ds-graph-holder'), this, query)
  }

  interactive_properties() : PropertyList {
    return super.interactive_properties().concat([
      'transform',
      'format',
      'chart.y-axis-label',
      { name: 'show_grid', type: 'boolean' },
      { name: 'show_numbers', type: 'boolean' },
      {
        name: 'orientation',
        type: 'select',
        edit_options: {
          source: [
            'horizontal',
            'vertical'
          ]
        }
      }
    ])
  }
}
register_dashboard_item(DiscreteBarChart)
