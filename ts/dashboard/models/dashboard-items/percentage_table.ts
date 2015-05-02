module ts {
  export module models {

    // TODO: make a table base class
    export class PercentageTable extends Presentation {
      static meta: DashboardItemMetadata = {
        item_type: 'percentage_table',
        display_name: 'Percentage Table',
        icon: 'fa fa-table',
        category: 'data-table',
        requires_data: true,
        template: ds.templates.models.percentage_table
      }

      format: string = ',.3s'
      title: string
      striped: boolean = true
      sortable: boolean = true
      include_sums: boolean = false
      invert_axes: boolean = false
      transform: string = 'sum'

      constructor(data?: any) {
        super(data)
        if (data) {
          this.include_sums = data.include_sums
          this.invert_axes = data.invert_axes
          this.striped = Boolean(data.striped)
          this.sortable = Boolean(data.sortable)
          this.title = data.title
          this.format = data.format || this.format
          this.transform = data.transform || this.transform
        }
      }

      toJSON() : any {
        var data = super.toJSON()
        if (this.format)
          data.format = this.format
        if (this.invert_axes)
          data.invert_axes = this.invert_axes
        if (this.striped)
          data.striped = this.striped
        if (this.sortable)
          data.sortable = this.sortable
        if (this.title)
          data.title = this.title
        if (this.transform)
          data.transform = this.transform
        data.include_sums = this.include_sums
        return data
      }

      data_handler(query) {
        query.summation.percent_value = query.summation[this.transform]

        query.data.forEach((series) => {
          series.summation.percent = 1 / (query.summation[this.transform] / series.summation[this.transform])
          series.summation.percent_value = series.summation[this.transform]
        })

        var holder = $('#' + this.item_id + ' .ds-percentage-table-holder')
        holder.empty()
        holder.append(ds.templates.models.percentage_table_data({item:this, query:query}))
        if (this.sortable) {
          var table = $('#' + this.item_id + ' .ds-percentage-table-holder table')
          table.DataTable({
            order: [[ 2, "desc" ]],
            paging: false,
            searching: true,
            oLanguage: { sSearch: "" },
            info: true
          })
        }
      }

      interactive_properties(): PropertyListEntry[] {
        return super.interactive_properties().concat([
          { name: 'striped', type: 'boolean' },
          { name: 'sortable', type: 'boolean' },
          { name: 'invert_axes', type: 'boolean' },
          'format',
          'title',
          {
            name: 'include_sums',
            type: 'boolean'
          },
          'transform'
        ])
      }
    }
    ts.models.register_dashboard_item(PercentageTable)
  }
}
