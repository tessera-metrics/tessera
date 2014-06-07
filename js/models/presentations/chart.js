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

ds.models.chart.interactive_properties = function() {
  return [
    'title'
    // 'options'
  ].map(function(name) {
           return ds.models.property({name: name})
         })
}
