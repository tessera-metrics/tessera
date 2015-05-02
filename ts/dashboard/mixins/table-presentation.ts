module ts {
  export module models {

    export class TablePresentation extends Presentation {
      striped: boolean = false
      sortable: boolean = false
      format: string = ',.3s'
      title: string

      constructor(data?: any) {
        super(data)
        if (data) {
          this.striped = !!data.striped
          this.sortable = !!data.sortable
          this.title = data.title
          this.format = data.format || this.format
        }
      }

      toJSON() : any {
        return $.extend(super.toJSON(), {
          striped: this.striped,
          sortable: this.sortable,
          format: this.format,
          title: this.title
        })
      }

      interactive_properties() : PropertyList {
        return super.interactive_properties().concat([
          { name: 'striped', type: 'boolean' },
          { name: 'sortable', type: 'boolean' },
          'format',
          'title',
        ])
      }
    }
  }
}
