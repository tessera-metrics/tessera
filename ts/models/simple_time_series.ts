module ts {
  export module models {

    export class SimpleTimeSeries extends Chart {
      static meta: DashboardItemMetadata = {
        icon: 'fa fa-line-chart',
        category: 'chart'
      }

      filled: boolean = false
      show_max_value: boolean = false
      show_min_value: boolean = false
      show_last_value: boolean = false

      constructor(data?: any) {
        super(data)
        if (data) {
          this.legend = data.legend
          this.filled = Boolean(data.filled)
          this.show_max_value = Boolean(data.show_max_value)
          this.show_min_value = Boolean(data.show_min_value)
          this.show_last_value = Boolean(data.show_last_value)
          if (!this.height) {
            this.height = 1
          }
        }
      }

      toJSON() : any {
        return $.extend(super.toJSON(), {
          filled: this.filled,
          show_max_value: this.show_max_value,
          show_min_value: this.show_min_value,
          show_last_value: this.show_last_value
        })
      }

      data_handler(query: ts.models.data.Query) : void {
        let selector = `#${this.item_id} .ds-graph-holder`
        if (this.filled) {
          ts.charts.simple_area_chart($(selector), this, query)
        } else {
          ts.charts.simple_line_chart($(selector), this, query)
        }
      }

      interactive_properties() : PropertyList {
        return super.interactive_properties().concat([
          { name: 'filled', type: 'boolean' },
          { name: 'show_max_value', type: 'boolean' },
          { name: 'show_min_value', type: 'boolean' },
          { name: 'show_last_value', type: 'boolean' }
        ])
      }
    }
    ts.models.register_dashboard_item(SimpleTimeSeries)
  }
}
