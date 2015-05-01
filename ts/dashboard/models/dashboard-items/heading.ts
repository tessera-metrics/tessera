module ts {
  export module models {

    export class Heading {
      static meta: DashboardItemMetadata = {
        item_type: 'heading',
        display_name: 'Heading',
        icon: 'fa fa-header',
        category: 'display',
        template: ds.templates.models.heading
      }

      text: string
      level: number = 1
      description: string

      constructor(data?: any) {
        super(data)
        if (data) {
          this.text = data.text
          this.level = data.level || this.level
          this.description = data.description
        }
      }

      toJSON() : any {
        var data = super.toJSON()
        if (self.text)
          data.text = self.text
        if (self.level)
          data.level = self.level
        if (self.description)
          data.description = self.description
        return data
      }

      interactive_properties() : PropertyListEntry[] {
        return [
          'text',
          { name: 'level', type: 'number' },
          'description'
        ]
      }
    }
    ts.models.register_dashboard_item(Heading)
  }
}
