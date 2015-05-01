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
        if (this.text)
          data.text = this.text
        if (this.level)
          data.level = this.level
        if (this.description)
          data.description = this.description
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
