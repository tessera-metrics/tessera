/**
 * Mixin for all dashboard items that contain other items.
 */
ds.models.container =
  (function() {
    'use strict';

    function init(target, data) {
      if (data && data.items) {
        target.items = data.items.map(function(i) {
                         return ds.models.factory(i);
                       });
      }
    }

    function extend(builder, options) {
      Object.defineProperty(builder.target, 'is_container', {value: true});
      builder.property('items', {init: []})
             .property('length', {
               get: function(context) {
                 return context.items.length
               }
             })

      var self = builder.target

      self.visit = function(visitor) {
        visitor(self)
        self.items.forEach(function(item) {
          if (item.visit && typeof(item.visit) == 'function') {
            item.visit(visitor)
          } else {
            visitor(item)
          }
        })
        return self
      }

      self.add = function(item) {
        self.items.push(item)
        return self
      }

      return builder
    }

    function json(target, data) {
      data = data || {}
      data.items = target.items.map(function(i) {
                     return i.toJSON()
                   })
      return data
    }

    return {
      extend: extend,
      init: init,
      json: json
    }
  })()
