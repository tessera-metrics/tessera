module ts {
  export module models {

    export class Singlestat extends DashboardItem {
      static meta: DashboardItemMetadata = {
        item_type: 'singlestat',
        category: 'data-table',
        icon: 'fa fa-subscript',
        display_name: 'Singlestat',
        template: ds.templates.models.singlestat,
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
          self.title = data.title
          self.units = data.units
          self.format = data.format || self.format
          self.index = data.index
          self.transform = data.transform || self.transform
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


      toJSON() {
        let data = super.toJSON()
        if (self.title)
          data.title = self.title
        if (self.format)
          data.format = self.format
        if (self.transform)
          data.transform = self.transform
        if (self.units)
          data.units = self.units
        if (self.index)
          data.index = self.index
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
