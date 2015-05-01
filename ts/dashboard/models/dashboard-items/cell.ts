module ts {
  export module models {

    export class Cell extends Container {
      static meta: DashboardItemMetadata = {
        item_type:    'cell',
        category:     'structural',
        display_name: 'Cell',
        template:     ds.templates.models.cell
      }

      span: number = 3
      offset: number
      align: string

      constructor(data?: any) {
        super(data)
        if (data) {
          this.span = this.span || data.span
          this.offset = data.offset
          this.align = data.align
        }
      }

      toJSON() : any {
        var data = super.toJSON()
        if (self.span)
          data.span = self.span
        if (self.offset)
          data.offset = self.offset
        if (self.align)
          data.align = self.align
        return data
      }

      interactive_properties() : PropertyListEntry[] {
        return super.interactive_properties().concat([
          'style',
          'css_class',
          { name: 'span', type: 'number' },
          { name: 'offset', type: 'number' },
          {
            name: 'align',
            type: 'select',
            edit_options: {
              source: [
                undefined,
                'left',
                'center',
                'right'
              ]
            }
          }
        ])
      }
      ts.models.register_dashboard_item(Cell)
  }
}
