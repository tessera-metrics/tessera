module ts {
  export module models {

    export class Cell extends Container {
      static meta: DashboardItemMetadata = {
        category:     'structural',
        requires_data: false,
      }

      span: number = 3
      offset: number
      align: string

      constructor(data?: any) {
        super(data)
        if (data) {
          this.span = data.span || this.span
          this.offset = data.offset
          this.align = data.align
        }
      }

      set_span(value: number) : Cell {
        this.span = value
        return this
      }

      set_offset(value: number) : Cell {
        this.offset = value
        return this
      }

      set_align(value: string) : Cell {
        this.align = value
        return this
      }

      toJSON() : any {
        var data = super.toJSON()
        if (this.span)
          data.span = this.span
        if (this.offset)
          data.offset = this.offset
        if (this.align)
          data.align = this.align
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
    }
    ts.models.register_dashboard_item(Cell)
  }
}
