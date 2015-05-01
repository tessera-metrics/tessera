module ts {
  export module models {

    export class Section extends Container {
      static meta: DashboardItemMetadata = {
        item_type: 'section',
        display_name: 'Section',
        category: 'structural',
        requires_data: false,
        template: ds.templates.models.section
      }


      title: string
      description: string
      level: number = 1
      horizontal_rule: boolean = true
      layout: string = 'fixed'

      constructor(data?: any) {
        super(data)
        if (data) {
          this.title = data.title
          this.description = data.description
          this.level = data.level || this.level
          if (typeof(data.horizontal_rule !== 'undefined'))
            this.horizontal_rule = Boolean(data.horizontal_rule)
          this.layout = data.layout || this.layout
        }
      }

      toJSON() :any {
        var data = super.toJSON()
        if (this.title)
          data.title = this.title
        if (this.description)
          data.description = this.description
        data.level = this.level
        data.horizontal_rule = this.horizontal_rule
        if (this.layout)
          data.layout = this.layout
        return data
      }

      interactive_properties(): PropertyListEntry[] {
        return [
          { name: 'layout',
            type: 'select',
            edit_options: {
              source: [
                'fixed',
                'fluid',
                'none'
              ]
            }
          },
          'style',
          'css_class',
          'title',
          'description',
          { name: 'level', type: 'number' },
          { name: 'horizontal_rule', type: 'boolean' }
        ]
      }

      ts.models.register_dashboard_item(Section)
    }
  }
}
