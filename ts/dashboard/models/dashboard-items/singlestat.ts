module ts {
  export module models {

    export class Singlestat extends Presentation {
      static meta: DashboardItemMetadata = {
        category: 'data-table',
        icon: 'fa fa-subscript',
        requires_data: true
      }

      title: string
      units: string
      format: string = ',.3s'
      index: number
      transform: string = 'mean'

      constructor(data?: any) {
        super(data)
        if (data) {
          this.title = data.title
          this.units = data.units
          this.format = data.format || this.format
          this.index = data.index
          this.transform = data.transform || this.transform
        }
      }

      data_handler(query: ts.models.data.Query) : void {
        if (!query.summation)
          return
        var element = $('#' + this.item_id + ' span.value')
        var value = query.summation[this.transform]
        if (this.index) {
          value = query.data[this.index].summation[this.transform]
        }
        element.text(d3.format(this.format)(value))
      }


      toJSON() : any {
        let data = super.toJSON()
        if (this.title)
          data.title = this.title
        if (this.format)
          data.format = this.format
        if (this.transform)
          data.transform = this.transform
        if (this.units)
          data.units = this.units
        if (this.index)
          data.index = this.index
        return data
      }

      interactive_properties(): PropertyListEntry[] {
        return super.interactive_properties().concat([
          'title',
          'units',
          'format',
          { name: 'index', type: 'number' },
          'transform'
        ])
      }
    }
    ts.models.register_dashboard_item(Singlestat)

  }
}
