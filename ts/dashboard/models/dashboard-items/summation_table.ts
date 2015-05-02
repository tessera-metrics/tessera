module ts {
  export module models {
    export class SummationTable extends TablePresentation {
      static meta: DashboardItemMetadata = {
        item_type: 'summation_table',
        display_name: 'Summation Table',
        icon: 'fa fa-table',
        category: 'data-table',
        requires_data: true,
        template: ds.templates.models.summation_table
      }

      show_color: boolean = false
      options: any
      palette: string

      constructor(data?: any) {
        super(data)
        if (data) {
          this.show_color = Boolean(data.show_color)
          this.options = data.options
        }
      }

      toJSON() :any {
        var data = super.toJSON()
        if (this.show_color)
          data.show_color = this.show_color
        if (this.options)
          data.options = this.options
        return data
      }

      data_handler(query: ts.models.data.Query) : void {
        ts.log.logger('tessera.items.summation_table').debug('data_handler(): '
                                                             + query.name + '/' + this.item_id)
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
          { name: 'show_color', type: 'boolean' },
          'chart.palette'
        ])
      }
    }
    ts.models.register_dashboard_item(SummationTable)
  }
}
