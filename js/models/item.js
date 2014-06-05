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
        if (data.item_id)
          target.item_id = data.item_id
        target.query = data.query
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
             .property('is_immediate_query', {
               get: function(context) {
                 return typeof(context.query) !== 'string'
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

      self.visit = function(visitor) {
        visitor(self)
      }

      /**
       * Various visitors for convenience.
       */

      self.flatten = function() {
        var flat = []
        self.visit(function(item) {
          if (item.item_type) {
            flat.push(item)
          }
        })
        return flat
      }

      self.get_queries = function() {
        var queries = {}
        self.visit(function(i) {
          if (typeof(i.query) !== 'undefined') {
            queries[i.query.name] = i.query
          }
        })
        return queries
      }

      return builder
    }

    function json(target, data) {
      data = data || {}
      data.item_type = target.item_type
      if (target.item_id)
        data.item_id = target.item_id
      if (target.query) {
        data.query = target.is_immediate_query ? target.query.toJSON() : target.query.name
      }
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

ds.models.item.Style = {
  WELL:            'well',
  CALLOUT_NEUTRAL: 'callout_neutral',
  CALLOUT_INFO:    'callout_info',
  CALLOUT_SUCCESS: 'callout_success',
  CALLOUT_WARNING: 'callout_warning',
  CALLOUT_DANGER:  'callout_danger'
}

ds.models.item.Transform = {
  SUM: 'sum',
  MIN: 'min',
  MAX: 'max',
  MEAN: 'mean'
}

ds.models.item.interactive_properties = function() {
  return ['query', 'css_class', 'height'].map(function(name) {
           return ds.models.property({name: name})
         })
}
