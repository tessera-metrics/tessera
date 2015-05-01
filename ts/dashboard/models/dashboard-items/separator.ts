module ts {
  export module models {
    export class Separator extends DashboardItem {
      static meta: DashboardItemMetadata = {
        item_type: 'separator',
        display_name: 'Separator',
        icon: 'fa fa-arrows-h',
        category: 'display',
        template: ds.templates.models.separator,
        requires_data: false
      }

      constructor(data?: any) {
        super(data)
      }

      interactive_properties() : PropertyListEntry[] {
        return [ 'css_class' ]
      }
    }
    ts.models.register_dashboard_item(Separator)
  }
}
