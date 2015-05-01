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
          self.legend = undefined
          self.transform = data.transform || self.transform
          self.orientation = data.orientation || self.orientation
          self.format = data.format || self.format
          if (typeof(data.show_grid) !== 'undefined') {
            self.show_grid = Boolean(data.show_grid)
          }
          if (typeof(data.show_numbers) !== 'undefined') {
            self.show_numbers = Boolean(data.show_numbers)
          }
          if (typeof(data.hide_zero_series !== 'undefined')) {
            self.hide_zero_series = Boolean(data.hide_zero_series)
          }
        }
      }

      toJSON() : any {
        return $.extend(super.toJSON(), {
          orientation: self.orientation,
          transform: self.transform,
          format: self.format,
          show_grid: self.show_grid,
          show_numbers: self.show_numbers,
          hide_zero_series: self.hide_zero_series
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
