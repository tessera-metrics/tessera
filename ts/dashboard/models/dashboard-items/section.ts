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
          self.title = data.title
          self.description = data.description
          self.level = data.level || self.level
          if (typeof(data.horizontal_rule !== 'undefined'))
            self.horizontal_rule = Boolean(data.horizontal_rule)
          self.layout = data.layout || self.layout
        }
      }

      toJSON() :any {
        var data = super.toJSON()
        if (self.title)
          data.title = self.title
        if (self.description)
          data.description = self.description
        data.level = self.level
        data.horizontal_rule = self.horizontal_rule
        if (self.layout)
          data.layout = self.layout
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
