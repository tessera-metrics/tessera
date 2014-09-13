/**
 * Mixin for all dashboard items that contain other items.
 */
ds.models.container =
  (function() {
    'use strict'

    function init(target, data) {
      if (data && data.items) {
        target.items = data.items.map(function(i) {
                         return ds.models.factory(i)
                       })
      }
    }

    function extend(builder, options) {
      Object.defineProperty(builder.target, 'is_container', {value: true})
      builder.property('items', {init: []})
             .property('length', {
               get: function(context) {
                 return context.items.length
               }
             })

      var self = builder.target

      self.find = function(item_or_id) {
        var id = item_or_id
        if (item_or_id instanceof Object && item_or_id.item_id) {
          id = item_or_id.item_id
        }
        for (var i = 0; i < self.items.length; i++) {
          if (self.items[i].item_id === id) {
            return Number(i)
          }
        }
        return -1
      }

      self.contains = function(item_or_id) {
        return self.find(item_or_id) > -1
      }

      self.visit = function(visitor) {
        visitor(self)
        self.items.forEach(function(item) {
          if (item.visit && typeof(item.visit) === 'function') {
            item.visit(visitor)
          } else {
            visitor(item)
          }
        })
        return self
      }

      self.add = function(item) {
        if (typeof(item) === 'string') {
          item = ds.models.factory(item)
        }
        self.items.push(item)
        self.notify('items')
        /* This should go in an event handler */
        ds.manager.current.dashboard.update_index()
        ds.manager.update_item_view(self)
        return self
      }

      self.add_after = function(item, new_item) {
        var index = self.find(item)
        if ((index === -1) || index === (self.length - 1)) {
          self.items.push(new_item)
        } else {
          self.items.splice(index + 1, 0, new_item)
        }
        self.notify('items')
        return self
      }

      self.remove = function(item) {
        var index = self.find(item)
        if (index < 0) {
          return false
        }
        self.items.splice(index, 1)
        self.notify('items')
        return true
      }

      /**
       * Move the position of a child item in the list, either up or
       * down one position. The position will not wrap - if the child
       * is a the beginning or end of the list, it will not be moved.
       *
       * @param item {object} A dashboard item. Must be a child of
       *                      this container.
       * @param increment {number} Either 1 to move the element up one
       *                           place, or -1 to move it back one
       *                           element.
       */
      self.move = function(item, increment) {
        var index = self.find(item)
        if (index < 0) {
          return false
        }
        if (index == 0 && increment < 0) {
          return false
        }
        if (index == (self.length - 1) && increment > 0) {
          return false
        }
        var target_index = index + increment
        var tmp = self.items[target_index]
        self.items[target_index] = item
        self.items[index] = tmp
        self.notify('items')
        return true
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
