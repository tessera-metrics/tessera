module ts {
  export module models {

    export class Singlegraph extends Chart {
      static meta: DashboardItemMetadata = {
        icon: 'fa fa-image',
        category: 'chart',
        requires_data: true
      }

      format: string = ',.1s'
      transform: string = 'mean'
      index: number

      constructor(data?: any) {
        super(data)
        if (data) {
          this.format = data.format || this.format
          this.transform = data.transform || this.transform
          this.index = data.index
          if (!this.height)
            this.height = 1
        }
      }

      toJSON() : any {
        return $.extend(super.toJSON(), {
          format: this.format,
          transform: this.transform,
          index: this.index
        })
      }

      data_handler(query) {
        if (!query.data)
          return
        ds.charts.simple_area_chart($("#" + this.item_id + ' .ds-graph-holder'), this, query)
        this.options.margin = { top: 0, left: 0, bottom: 0, right: 0 }
        var label = query.data[this.index || 0].key
        var value = query.summation[this.transform]
        if (this.index) {
          value = query.data[this.index].summation[this.transform]
        }
        $('#' + this.item_id + ' span.value').text(d3.format(this.format)(value))
        $('#' + this.item_id + ' span.ds-label').text(label)
      }

      interactive_properties(): PropertyListEntry[] {
        return super.interactive_properties().concat([
          'format', 'transform'
        ])
      }
    }
    ts.models.register_dashboard_item(Singlegraph)
  }
}
