/**
 * Base mixin for all dashboard items
 */
ds.models.item =
  (function() {
    'use strict'

    function init(target, data) {
      if (data) {
        if (data.item_type)
          target.item_type = data.item_type
        target.item_id = data.item_id
        target.query = data.query || {}
        target.css_class = data.css_class
        target.height = data.height
        target.style = data.style
        if (data.thresholds)
          target.thresholds = ds.models.thresholds(data.thresholds)
      }
      return target
    }

    function extend(builder, options) {
      Object.defineProperty(builder.target, 'is_dashboard_item', {value: true})
      options = options || {}
      builder.property('item_type', {init: options.item_type })
             .property('item_id')
             .property('css_class')
             .property('height')
             .property('style')
             .property('thresholds') // moving to Query
             .property('interactive')
             .property('dashboard')
             .property('query', {
               get: function(context) {
                 if (typeof(context.query) === 'string' && context.dashboard) {
                   return context.dashboard.definition.queries[context.query]
                 } else {
                   return context.query
                 }
               }
             })


      /**
       * Operations
       */

      var self = builder.target

      self.render = function() {
        var template = ds.templates.models[self.item_type]
        if (template) {
          if (template.dataHandler && self.query) {
            self.query.on_load(function(q) {
              template.dataHandler(q, self)
            })
          }
          return template({item: self})
        } else {
          return "<p>Unknown item type <code>" + self.item_type + "</code></p>"
        }
      }

      // TODO: this should use streams
      self.flatten = function(filter) {
        var flat = []
        self.visit(function(item) {
          if (item.item_type) {
            if (filter && (filter instanceof Function)) {
              if (!filter(item))
                return
            }
            flat.push(item)
          }
        })
        return flat
      }

      return builder
    }

    function json(target, data) {
      data = data || {}
      data.item_type = target.item_type
      if (target.item_id)
        data.item_id = target.item_id
      if (target.query)
        data.query = typeof(target.query) === 'string' ? target.query : target.query.toJSON()
      if (target.css_class)
        data.css_class = target.css_class
      if (target.height)
        data.height = target.height
      if (target.style)
        data.style = target.style
      if (target.thresholds) {
        data.thresholds = target.thresholds.toJSON()
      }
      return data
    }

    return {
      extend: extend,
      init: init,
      json: json
    }
  })()
