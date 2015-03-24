/**
 * Mixin for all chart presentation types
 */
ds.models.chart =
  (function() {
    'use strict'

    function extend(builder) {
      Object.defineProperty(builder.target, 'is_chart', {value: true})
      return builder.property('title')
                    .property('legend',  { init: ds.models.chart.LegendType.SIMPLE })
                    .property('options', { init: {} })
    }

    function init(target, data) {
      if (data) {
        if (typeof(data.legend) !== 'undefined') {
          target.legend = data.legend
          if (typeof(data.legend) === 'boolean')
            target.legend = data.legend ? ds.models.chart.LegendType.SIMPLE : undefined
        }
        target.title = data.title
        target.options = data.options || {}
        if (data.options && data.options.y1) {
          target.options.y1 = ds.models.Axis(data.options.y1)
        }
        if (data.options && data.options.y2) {
          target.options.y2 = ds.models.Axis(data.options.y2)
        }
        if (data.options && data.options.x) {
          target.options.x = ds.models.Axis(data.options.x)
        }
      }
      return target
    }

    function json(target, data) {
      data = data || {}
      if (target.title)
        data.title = target.title
      data.legend = target.legend
      if (target.options) {
        data.options = ds.extend(target.options)
        if (target.options.y1) {
          data.options.y1 = ds.json(target.options.y1)
        }
        if (target.options.y2) {
          data.options.y2 = ds.json(target.options.y2)
        }
        if (target.options.x) {
          data.options.x = ds.json(target.options.x)
        }
      }
      return data
    }

    return {
      extend: extend,
      init: init,
      json: json
    }
  })()

ds.property.register(  {
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
)

/**
 * Clearly, a bunch of this should be refactored into a common
 * model. Should probably make chart.options a property model object.
 */
ds.models.chart.interactive_properties = [
  'title',
  {
    id: 'chart.y-axis-label',
    name: 'y-axis-label',
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
    id: 'chart.y-axis-min',
    name: 'y-axis-min',
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
    id: 'chart.y-axis-max',
    name: 'y-axis-max',
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
    id: 'chart.legend',
    name: 'legend',
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

ds.models.chart.LegendType = {
  SIMPLE: 'simple',
  TABLE: 'table'
}
