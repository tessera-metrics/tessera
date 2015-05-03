module ts {
  export module models {

    export class StackedAreaChart extends Chart {
      static meta: DashboardItemMetadata = {
        icon: 'fa fa-area-chart',
        category: 'chart'
      }

      stack_mode: string = ts.charts.StackMode.NORMAL

      constructor(data?: any) {
        super(data)
        if (data) {
          this.stack_mode = data.stack_mode || this.stack_mode
        }
      }

      toJSON() : any {
        return $.extend(super.toJSON(), {
          stack_mode: this.stack_mode
        })
      }

      data_handler(query: ts.models.data.Query) : void {
        ts.charts.stacked_area_chart($('#' + this.item_id + ' .ds-graph-holder'), this, query)
      }

      interactive_properties() : PropertyList {
        return super.interactive_properties().concat([
          {
            name: 'stack_mode',
            type: 'select',
            edit_options: {
              source: [
                ts.charts.StackMode.NONE,
                ts.charts.StackMode.NORMAL,
                ts.charts.StackMode.PERCENT,
                ts.charts.StackMode.STREAM
              ]
            }
          }
        ])
      }
    }
    ts.models.register_dashboard_item(StackedAreaChart)
  }
}
