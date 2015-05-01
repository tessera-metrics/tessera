module ts {
  export module models {

    ts.properties.register(  {
      name:          'chart.palette',
      property_name: 'palette',
      category:      'chart',

      edit_options: {
        type: 'select',

        value: function(item) {
          if (item.options && item.options.palette) {
            return item.options.palette
          } else {
            return undefined
          }
        },

        source: [ { text: 'None', value: undefined } ]
          .concat(Object.keys(ds.charts.util.colors).map(function(value, index) {
            return { text: value, value: value }
          })),

        update: function(item, newValue) {
          if (!item.options) {
            item.options = {}
          }
          item.options.palette = newValue
        }
      }
    })

    export const ChartLegendType = {
      SIMPLE: 'simple',
      TABLE: 'table'
    }

    /**
     * Base class for all chart presentation types
     */
    export class Chart extends DashboardItem {
      is_chart: boolean = true // TODO: remove this
      title: string
      legend: string = ChartLegendType.SIMPLE
      options: any = {}

      constructor(data?: any) {
        super(data)
        if (data) {
          if (typeof(data.legend) !== 'undefined') {
            this.legend = data.legend
            if (typeof(data.legend) === 'boolean')
              this.legend = data.legend ? ds.models.chart.LegendType.SIMPLE : undefined
          }
          this.title = data.title
          this.options = data.options || {}
          if (data.options && data.options.y1) {
            this.options.y1 = ds.models.Axis(data.options.y1)
          }
          if (data.options && data.options.y2) {
          this.options.y2 = ds.models.Axis(data.options.y2)
          }
          if (data.options && data.options.x) {
            this.options.x = ds.models.Axis(data.options.x)
          }

        }
      }

      toJSON() : any {
        let data : any = {}
        if (this.title)
          data.title = this.title
        data.legend = this.legend
        if (this.options) {
          data.options = $.extend({}, this.options)
          if (this.options.y1) {
            data.options.y1 = ds.json(this.options.y1)
          }
          if (this.options.y2) {
            data.options.y2 = ds.json(this.options.y2)
          }
          if (this.options.x) {
            data.options.x = ds.json(this.options.x)
          }
        }
        return $.extend(super.toJSON(), data)
      }

      /**
       * Clearly, a bunch of this should be refactored into a common
       * model. Should probably make chart.options a property model object.
       */
      interactive_properties() : PropertyListEntry[] {
        let props = [
          'title',
          {
            name: 'chart.y-axis-label',
            property_name: 'y-axis-label',
            category: 'chart',
            edit_options: {
              type: 'text',
              value: function(item) {
                if (item.options && item.options.y1) {
                  return item.options.y1.label
                } else if (item.options) {
                  /* legacy */
                  return item.options.yAxisLabel
                } else {
                  return undefined
                }
              },
              update: function(item, newValue) {
                if (!item.options) {
                  item.options = {}
                }
                if (!item.options.y1) {
                  item.options.y1 = ds.models.Axis()
                }
                item.options.y1.label = newValue
              }
            }
          },
          {
            name: 'chart.y-axis-min',
            property_name: 'y-axis-min',
            category: 'chart',
            edit_options: {
              type: 'text',
              value: function(item) {
                return item.options && item.options.y1
                  ? item.options.y1.min
                  : undefined
              },
              update: function(item, newValue) {
                if (!item.options) {
                  item.options = {}
                }
                if (!item.options.y1) {
                  item.options.y1 = ds.models.Axis()
                }
                item.options.y1.min = newValue
              }
            }
          },
          {
            name: 'chart.y-axis-max',
            property_name: 'y-axis-max',
            category: 'chart',
            edit_options: {
              type: 'text',
              value: function(item) {
                return item.options && item.options.y1
                  ? item.options.y1.max
                  : undefined
              },
              update: function(item, newValue) {
                if (!item.options) {
                  item.options = {}
                }
                if (!item.options.y1) {
                  item.options.y1 = ds.models.Axis()
                }
                item.options.y1.max = newValue
              }
            }
          },
          'chart.palette',
          {
            name: 'chart.legend',
            property_name: 'legend',
            category: 'chart',
            edit_options: {
              type: 'select',
              source: [
                undefined,
                'simple',
                'table'
              ]
            }
          }
        ]
        return super.interactive_properties().concat(props)
      }

    } // end class Chart

  } // end module models
} // end module ts
