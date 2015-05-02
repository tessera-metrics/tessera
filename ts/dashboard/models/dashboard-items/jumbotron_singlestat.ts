module ts {
  export module models {

    export class JumbotronSinglestat extends Singlestat {
      static meta: DashboardItemMetadata = {
        icon: 'fa fa-subscript',
        category: 'data-table',
        requires_data: true
      }

      constructor(data?: any) {
        super(data)
      }
    }
    ts.models.register_dashboard_item(JumbotronSinglestat)
  }
}
