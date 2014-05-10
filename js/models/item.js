ds.models.item = function(data) {
  "use strict";

  var parent
    , storage = {}
    , self = {}


  limivorous.observable(self, storage)
            .property('item_type')
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
  Object.defineProperty(self, 'is_dashboard_item', {value: true});

  if (data) {
    self.item_type = data.item_type;
    self.item_id = data.item_id;
    self.query = data.query || {};
    self.css_class = data.css_class;
    self.height = data.height;
    self.style = data.style;
    self.thresholds = ds.models.thresholds(data.thresholds)
  }

  // temporary alias
  self.set_type = self.set_item_type

  self.rebind = function(target) {
    parent = target;
    d3.rebind(target, self, 'set_type', 'set_item_type', 'set_query', 'set_css_class', 'set_item_id','set_height', 'set_style', 'set_thresholds', 'set_interactive', 'set_dashboard', 'render', 'flatten');
    ds.rebind_properties(target, self, 'item_type', 'query', 'css_class', 'item_id', 'height', 'style', 'thresholds', 'interactive', 'dashboard');
    Object.defineProperty(target, '_base', {value: self});
    Object.defineProperty(target, 'is_dashboard_item', {value: true});
    return self;
  }

  /**
   * Operations
   */

  self.render = function() {
    var template = ds.templates.models[self.item_type];
    if (template) {
      if (template.dataHandler && self.query) {
        self.query.on_load(function(q) {
          template.dataHandler(q, parent);
        });
      }
      return template({item: parent});
    } else {
      return "<p>Unknown item type <code>" + self.item_type + "</code></p>";
    }
  }

  // TODO: this should use streams
  self.flatten = function(filter) {
    var items = [];
    parent.visit(function(item) {
      if (item.item_type) {
        if (filter && (filter instanceof Function)) {
          if (!filter(item))
            return;
        }
        items.push(item);
      }
    });
    return items;
  }

  self.toJSON = function(data_) {
    var data = data_ || {}
    data.item_type = self.item_type
    if (self.item_id)
      data.item_id = self.item_id
    // TODO: return query.toJSON() when server side supports it
    if (self.query)
      data.query = typeof(self.query) === 'string' ? self.query : self.query.name
    if (self.css_class)
      data.css_class = self.css_class
    if (self.height)
      data.height = self.height
    if (self.style)
      data.style = self.style
    if (self.thresholds) {
      data.thresholds = self.thresholds.toJSON()
    }
    return data
  }

  return self
}
