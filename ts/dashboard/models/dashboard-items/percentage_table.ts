module ts {
  export module models {

    // TODO: make a table base class
    export class PercentageTable {
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
          self.include_sums = data.include_sums
          self.invert_axes = data.invert_axes
          self.striped = Boolean(data.striped)
          self.sortable = Boolean(data.sortable)
          self.title = data.title
          self.format = data.format || self.format
          self.transform = data.transform || self.transform
        }
      }

      self.toJSON = function() {
        var data = super.toJSON()
        if (self.format)
          data.format = self.format
        if (self.invert_axes)
          data.invert_axes = self.invert_axes
        if (self.striped)
          data.striped = self.striped
        if (self.sortable)
          data.sortable = self.sortable
        if (self.title)
          data.title = self.title
        if (self.transform)
          data.transform = self.transform
        data.include_sums = self.include_sums
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
