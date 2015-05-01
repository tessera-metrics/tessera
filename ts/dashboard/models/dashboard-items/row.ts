module ts {
  export module models {

    export class Row extends Container {
      static meta: DashboardItemMetadata = {
        item_type: 'row',
        category: 'structural',
        display_name: 'Row',
        template: ds.templates.models.row
      }

      constructor(data?: any) {
        super(data)
      }

      interactive_properties() : PropertyListEntry[] {
        return [
          'style', 'css_class'
        ]
      }
    }
    ts.models.register_dashboard_item(Row)
  }
}
