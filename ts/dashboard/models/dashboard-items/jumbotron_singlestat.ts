module ts {
  export module models {

    // TODO: it should be straightforward for this to extend
    // Singlestat now, instead of duplicating most ofit.
    export class JumbotronSinglestat extends Presentation {
      static meta: DashboardItemMetadata = {
        item_type: 'jumbotron_singlestat',
        display_name: 'Jumbotron Singlestat',
        icon: 'fa fa-subscript',
        category: 'data-table',
        template: ds.templates.models.jumbotron_singlestat,
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

      toJSON() : any {
        var data = super.toJSON()
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

      data_handler(query) {
        var element = $('#' + this.item_id + ' span.value')
        var value = query.summation[this.transform]
        if (this.index) {
          value = query.data[this.index].summation[this.transform]
        }
        $(element).text(d3.format(this.format)(value))
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
    ts.models.register_dashboard_item(JumbotronSinglestat)
  }
}
