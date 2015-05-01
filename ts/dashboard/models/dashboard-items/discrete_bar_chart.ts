module ts {
  export module models {
    export class DiscreteBarChart extends Chart {
      static meta: DashboardItemMetadata = {
        item_type: 'discrete_bar_chart',
        display_name: 'Bar Chart (Discrete)',
        icon: 'fa fa-bar-chart',
        category: 'chart',
        template: ds.templates.models.discrete_bar_chart
      }

      transform: string = 'sum'
      orientation: string = 'vertical'
      format: string = ',.3s'
      show_grid: boolean = true
      show_numbers: boolean = true
      hide_zero_series: boolean = false

      constructor(data?: any) {
        super(data)
        if (data) {
          this.legend = undefined
          this.transform = data.transform || this.transform
          this.orientation = data.orientation || this.orientation
          this.format = data.format || this.format
          if (typeof(data.show_grid) !== 'undefined') {
            this.show_grid = Boolean(data.show_grid)
          }
          if (typeof(data.show_numbers) !== 'undefined') {
            this.show_numbers = Boolean(data.show_numbers)
          }
          if (typeof(data.hide_zero_series !== 'undefined')) {
            this.hide_zero_series = Boolean(data.hide_zero_series)
          }
        }
      }

      toJSON() : any {
        return $.extend(super.toJSON(), {
          orientation: this.orientation,
          transform: this.transform,
          format: this.format,
          show_grid: this.show_grid,
          show_numbers: this.show_numbers,
          hide_zero_series: this.hide_zero_series
        })
      }

      data_handler(query: ts.models.data.Query) : void {
        ds.charts.discrete_bar_chart($('#' + this.item_id + ' .ds-graph-holder'), this, query)
      }

      interactive_properties() : PropertyListEntry[] {
        return super.interactive_properties().concat([
          'transform',
          'format',
          { name: 'show_grid', type: 'boolean' },
          { name: 'show_numbers', type: 'boolean' },
          { name: 'hide_zero_series', type: 'boolean' },
          {
            name: 'orientation',
            type: 'select',
            edit_options: {
              source: [
                'horizontal',
                'vertical'
              ]
            }
          }
        ])
      }
    }
    ts.models.register_dashboard_item(DiscreteBarChart)
  }
}
