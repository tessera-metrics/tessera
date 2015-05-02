module ts {
  export module models {

    export class JumbotronSinglestat extends Singlestat {
      static meta: DashboardItemMetadata = {
        item_type: 'jumbotron_singlestat',
        display_name: 'Jumbotron Singlestat',
        icon: 'fa fa-subscript',
        category: 'data-table',
        template: ds.templates.models.jumbotron_singlestat,
        requires_data: true
      }

      constructor(data?: any) {
        super(data)
      }
    }
    ts.models.register_dashboard_item(JumbotronSinglestat)
  }
}
