/**
  * Mixin for transform types common fields
 */
ds.models.transform.transform =
  (function() {
    'use strict'

    function extend(builder, options) {
      options = options || {}
      Object.defineProperty(builder.target, 'is_transform', {value: true})
      return builder.property('transform_name', {init: options.transform_name})
                    .property('display_name', {init: options.display_name})
                    .property('transform_type', {init: options.transform_type || 'presentation'})
    }

    function init(target, data) {
      if (data) {
        target.transform_name = data.transform_name || target.transform_name
        target.display_name = data.display_name || target.display_name
        target.transform_type = data.transform_type || target.transform_type
      }
      return target
    }

    function json(target, data) {
      data = data || {}
      if (target.transform_name)
        data.transform_name = target.transform_name
      if (target.transform_type)
        data.transform_type = target.transform_type
      if (target.display_name)
        data.display_name = target.display_name
      return data
    }

    return {
      extend: extend,
      init: init,
      json: json
    }
  })()
