module ts {
  export module models {

    export class BarChart extends Chart {
      static meta: DashboardItemMetadata = {
        item_type: 'bar_chart',
        display_name: 'Bar Chart',
        icon: 'fa fa-bar-chart',
        category: 'chart',
        requires_data: true,
        template: ds.templates.models.bar_chart
      }

      stack_mode: string = ds.charts.StackMode.NORMAL

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
        ds.charts.bar_chart($('#' + this.item_id + ' .ds-graph-holder'), this, query)
      }

      interactive_properties() : PropertyListEntry[] {
        return super.interactive_properties().concat([
          {
            name: 'stack_mode',
            type: 'select',
            edit_options: {
              source: [
                ds.charts.StackMode.NONE,
                ds.charts.StackMode.NORMAL,
                ds.charts.StackMode.PERCENT,
                ds.charts.StackMode.STREAM
              ]
            }
          }
        ])
      }
    }
    ts.models.register_dashboard_item(BarChart)
  }
}
