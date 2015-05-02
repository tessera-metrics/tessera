module ts {
  export module models {

    export class StandardTimeSeries extends Chart {
      static meta: DashboardItemMetadata = {
        item_type: 'standard_time_series',
        display_name: 'Standard Time Series',
        icon: 'fa fa-line-chart',
        category: 'chart',
        template: ds.templates.models.standard_time_series,
        requires_data: true
      }

      constructor(data?: any) {
        super(data)
      }

      data_handler(query) : void {
        ds.charts.standard_line_chart($('#' + this.item_id + ' .ds-graph-holder'), this, query)
      }
    }
    ts.models.register_dashboard_item(StandardTimeSeries)
  }
}
