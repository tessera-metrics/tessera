module ts {
  export module models {

    export class SummationTable extends TablePresentation {
      static meta: DashboardItemMetadata = {
        icon:     'fa fa-table',
        category: 'data-table',
        requires_data: true
      }

      show_color: boolean = false
      options: any
      palette: string

      constructor(data?: any) {
        super(data)
        if (data) {
          this.show_color = !!data.show_color
          this.options = data.options
          this.palette = data.palette
        }
      }

      toJSON() :any {
        return ts.extend(super.toJSON(), {
          show_color: this.show_color,
          options: this.options,
          palette: this.palette
        })
      }

      data_handler(query: ts.models.data.Query) : void {
        ts.log.logger('tessera.items.summation_table').debug('data_handler(): '
                                                             + query.name + '/' + this.item_id)
        var options = this.options || {}
        var palette = ts.charts.util.get_palette(options.palette || this.palette)
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

      interactive_properties(): PropertyList {
        return super.interactive_properties().concat([
          { name: 'show_color', type: 'boolean' },
          'chart.palette'
        ])
      }
    }
    ts.models.register_dashboard_item(SummationTable)
  }
}
