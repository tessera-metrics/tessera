module ts {
  export module models {

    export class StandardTimeSeries extends Chart {
      static meta: DashboardItemMetadata = {
        icon: 'fa fa-line-chart',
        category: 'chart'
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
