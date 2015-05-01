module ts {
  export module models {
    export class SummationTable extends DashboardItem {
      static meta: DashboardItemMetadata = {
        item_type: 'summation_table',
        display_name: 'Summation Table',
        icon: 'fa fa-table',
        category: 'data-table',
        requires_data: true,
        template: ds.templates.models.summation_table
      }

      striped: boolean = false
      show_color: boolean = false
      sortable: boolean = false
      format: string = ',.3s'
      title: string
      options: any
      palette: string

      constructor(data?: any) {
        super(data)
        if (data) {
          this.striped = Boolean(data.striped)
          this.show_color = Boolean(data.show_color)
          this.sortable = Boolean(data.sortable)
          this.title = data.title
          this.format = data.format || this.format
          this.options = data.options
        }
      }

      toJSON() :any {
        var data = super.toJSON()
        if (this.format)
          data.format = this.format
        if (this.striped)
          data.striped = this.striped
        if (this.show_color)
          data.show_color = this.show_color
        if (this.sortable)
          data.sortable = this.sortable
        if (this.title)
          data.title = this.title
        if (this.options)
          data.options = this.options
        return data
      }

      data_handler(query: ts.models.data.Query) : void {
        ts.log.logger('tessera.items.summation_table').debug('data_handler(): '
                                                             + query.name + '/' + item.item_id)
        var options = this.options || {}
        var palette = ds.charts.util.get_palette(options.palette)
        var body = $('#' + this.item_id + ' tbody')
        body.empty()
        query.data.forEach((series, i) => {
          var color = palette[i % palette.length]
          body.append(ds.templates.models.summation_table_row({series:series, item:this, color: color}))
        })
        if (this.sortable) {
          body.parent().DataTable({
            autoWidth: false,
            paging: false,
            searching: false,
            info: false
          })
        }
      }

      interactive_properties(): PropertyListEntry[] {
        return super.interactive_properties().concat([
          { name: 'striped', type: 'boolean' },
          { name: 'show_color', type: 'boolean' },
          { name: 'sortable', type: 'boolean' },
          'format',
          'title',
          'chart.palette'
        ])
      }
    }
    ts.models.register_dashboard_item(SummationTable)
  }
}
