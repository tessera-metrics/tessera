import XYChart from './xychart'
import Query from '../data/query'
import { DashboardItemMetadata } from './item'
import * as charts from '../../charts/core'
import { extend } from '../../util'
import { PropertyList } from '../../core/property'
import * as core from '../../core'

declare var $

export default class StandardTimeSeries extends XYChart {
  static meta: DashboardItemMetadata = {
    alias: 'stacked_area_chart',
    icon: 'fa fa-area-chart',
    actions: [
      new core.Action({
        name: 'stack_mode_none',
        display: 'Lines',
        icon: 'fa fa-line-chart',
        handler: (action, item) => {
          item.stack_mode = charts.StackMode.NONE
          item.updated()
        }
      }),
      new core.Action({
        name: 'stack_mode_stacked',
        display: 'Stack',
        icon: 'fa fa-area-chart',
        handler: (action, item) => {
          item.stack_mode = charts.StackMode.NORMAL
          item.updated()
        }
      }),
      new core.Action({
        name: 'stack_mode_stream',
        display: 'Stream',
        icon: 'fa fa-area-chart',
        handler: (action, item) => {
          item.stack_mode = charts.StackMode.STREAM
          item.updated()
        }
      }),
      new core.Action({
        name: 'stack_mode_percent',
        display: 'Percent',
        icon: 'fa fa-area-chart',
        handler: (action, item) => {
          item.stack_mode = charts.StackMode.PERCENT
          item.updated()
        }
      })
    ]
  }

  stack_mode: string = charts.StackMode.NONE
  show_points: boolean = false
  show_lines: boolean = true

  constructor(data?: any) {
    super(data)
    if (data) {
      // Set defaults based on whether we're initializing from a legacy
      // stacked_area_chart or not.
      if ((data == 'stacked_area_chart') || (data.item_type == 'stacked_area_chart'))
        this.stack_mode = data.stack_mode || charts.StackMode.NORMAL
      else
        this.stack_mode = data.stack_mode || this.stack_mode
      if (typeof data.show_points !== 'undefined')
        this.show_points = !!data.show_points
      if (typeof data.show_lines !== 'undefined')
        this.show_lines = !!data.show_lines
      else
        this.show_lines = true
    }
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      stack_mode: this.stack_mode,
      show_points: this.show_points,
      show_lines: this.show_lines
    })
  }

  data_handler(query: Query) : void {
    charts.stacked_area_chart(`#${this.item_id} .ds-graph-holder`, this, query)
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
      },
      {
        name: 'show_points',
        type: 'boolean'
      },
      {
        name: 'show_lines',
        type: 'boolean'
      }
    ])
  }
}
