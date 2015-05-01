module ts {
  export module models {

    export class DonutChart extends Chart {
      static meta: DashboardItemMetadata = {
        item_type: 'donut_chart',
        display_name: 'Donut Chart',
        icon: 'fa fa-pie-chart',
        category: 'chart',
        template: ds.templates.models.donut_chart
      }

      labels: boolean = false
      is_pie: boolean = false
      hide_zero_series: boolean = false

      constructor(data?: any) {
        super(data)
        if (data) {
          if (typeof(data.labels) !== 'undefined') {
            self.labels = Boolean(data.labels)
          }
          if (typeof(data.is_pie) !== 'undefined') {
            self.is_pie = Boolean(data.is_pie)
          }
          if (typeof(data.hide_zero_series !== 'undefined')) {
            self.hide_zero_series = Boolean(data.hide_zero_series)
          }
        }
      }

      toJSON() : any {
        return $.extends(super.toJSON(), {
          labels: self.labels,
          is_pie: self.is_pie,
          hide_zero_series: self.hide_zero_series
        })
      }

      data_handler(query: ts.models.data.Query) : void {
        ds.charts.donut_chart($("#" + this.item_id + ' .ds-graph-holder'), this, query)
      }

      interactive_properties(): PropertyListEntry[] {
        return super.interactive_properties().concaat([
          { name: 'labels', type: 'boolean' },
          { name: 'is_pie', type: 'boolean' },
          { name: 'hide_zero_series', type: 'boolean' },
        ])
      }
    }
    ts.models.register_dashboard_item(DonutChart)
  }
}
