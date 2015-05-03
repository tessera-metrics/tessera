module ts {
  export module models {

    export class Row extends Container {
      static meta: DashboardItemMetadata = {
        category: 'structural'
      }

      constructor(data?: any) {
        super(data)
      }

      interactive_properties() : PropertyList {
        return [
          'style', 'css_class'
        ]
      }
    }
    ts.models.register_dashboard_item(Row)
  }
}
