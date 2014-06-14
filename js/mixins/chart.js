/**
 * Mixin for all chart presentation types
 */
ds.models.chart =
  (function() {
    'use strict'

    function extend(builder) {
      Object.defineProperty(builder.target, 'is_chart', {value: true})
      return builder.property('title')
                    .property('options', { init: {} })
    }

    function init(target, data) {
      if (data) {
        target.title = data.title
        target.options = data.options || {}
      }
      return target
    }

    function json(target, data) {
      data = data || {}
      if (target.title)
        data.title = target.title
      if (target.options)
        data.options = target.options
      return data
    }

    return {
      extend: extend,
      init: init,
      json: json
    }
  })()

ds.models.chart.interactive_properties = [
  'title',
  {
    id: 'chart.palette',
    name: 'palette',
    category: 'chart',

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
  }
]
