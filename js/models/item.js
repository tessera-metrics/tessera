ds.models.item = function(data) {
  "use strict";

  var item_type
    , item_id
    , query
    , css_class
    , height
    , style
    , thresholds
    , interactive = false // TODO: hack
    , parent
    , dashboard
    , self = {};

  if (data) {
    item_type = data.item_type;
    item_id = data.item_id;
    query = data.query || {};
    css_class = data.css_class;
    height = data.height;
    style = data.style;
    thresholds = ds.models.thresholds(data.thresholds)
  }

  Object.defineProperty(self, 'item_type', {get: function() { return item_type; }});
  Object.defineProperty(self, 'item_id', {get: function() { return item_id; }});
  Object.defineProperty(self, 'css_class', {get: function() { return css_class; }});
  Object.defineProperty(self, 'height', {get: function() { return height; }});
  Object.defineProperty(self, 'style', {get: function() { return style; }});
  Object.defineProperty(self, 'thresholds', {get: function() { return thresholds; }});
  Object.defineProperty(self, 'interactive', {get: function() { return interactive; }});
  Object.defineProperty(self, 'dashboard', {get: function() { return dashboard; }});
  Object.defineProperty(self, 'query', {get: function() {
                                          if (typeof(query) === 'string' && self.dashboard) {
                                            return self.dashboard.definition.queries[query];
                                          } else {
                                            return query;
                                          }
                                        }});

  self.rebind = function(target) {
    parent = target;
    d3.rebind(target, self, 'set_type', 'set_query', 'set_css_class', 'set_item_id','set_height', 'set_style', 'set_thresholds', 'set_interactive', 'set_dashboard', 'render', 'flatten');
    ds.rebind_properties(target, self, 'item_type', 'query', 'css_class', 'item_id', 'height', 'style', 'thresholds', 'interactive', 'dashboard');
    Object.defineProperty(target, '_base', {value: self});
    Object.defineProperty(target, 'is_dashboard_item', {value: true});
    return self;
  }

  /**
   * Operations
   */

  self.render = function() {
    var template = ds.templates.models[item_type];
    if (template) {
      if (template.dataHandler && query) {
        self.query.on_load(function(q) {
          template.dataHandler(q, parent);
        });
      }
      return template({item: parent});
    } else {
      return "<p>Unknown item type <code>" + item_type + "</code></p>";
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

  /**
   * Data mutators
   */

  self.set_type = function(_) {
    item_type = _;
    return self;
  }

  self.set_query = function(_) {
    query = _;
    return self;
  }

  self.set_css_class = function(_) {
    css_class = _;
    return self;
  }

  self.set_item_id = function(_) {
    item_id = _;
    return self;
  }

  self.set_height = function(_) {
    height = _;
    return self;
  }

  self.set_style = function(_) {
    style = _;
    return self;
  }

  self.set_thresholds = function(_) {
    thresholds = _;
    return self;
  }

  self.set_interactive = function(_) {
    interactive = _;
    return self;
  }

  self.set_dashboard = function(_) {
    dashboard = _;
    return self;
  }

  self.toJSON = function(data_) {
    var data = data_ || {};
    data.item_type = item_type;
    if (item_id)
      data.item_id = item_id;
    // TODO: return query.toJSON() when server side supports it
    if (query)
      data.query = typeof(query) === 'string' ? query : query.name;
    if (css_class)
      data.css_class = css_class;
    if (height)
      data.height = height;
    if (style)
      data.style = style;
    if (thresholds) {
      data.thresholds = thresholds.toJSON()
    }
    return data;
  }

  return self;
}
