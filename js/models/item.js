ds.models.item = function(data) {
  "use strict";

  var item_type
    , query
    , css_class
    , element_id
    , height
    , style
    , interactive = false // TODO: hack
    , parent
    , self = {};

  if (data) {
    item_type = data.item_type;
    query = data.query;
    css_class = data.css_class;
    element_id = data.element_id;
    height = data.height;
    style = data.style;
  }

  Object.defineProperty(self, 'item_type', {get: function() { return item_type; }});
  Object.defineProperty(self, 'query', {get: function() { return query; }});
  Object.defineProperty(self, 'css_class', {get: function() { return css_class; }});
  Object.defineProperty(self, 'element_id', {get: function() { return element_id; }});
  Object.defineProperty(self, 'height', {get: function() { return height; }});
  Object.defineProperty(self, 'style', {get: function() { return style; }});
  Object.defineProperty(self, 'interactive', {get: function() { return interactive; }}); // TODO: hack

  self.rebind = function(target) {
    parent = target;
    d3.rebind(target, self, 'set_type', 'set_query', 'set_css_class', 'set_element_id','set_height', 'set_style', 'set_interactive', 'render', 'flatten');
    ds.rebind_properties(target, self, 'item_type', 'query', 'css_class', 'element_id', 'height', 'style', 'interactive');
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
        var definition = cronenberg.dashboards.current.dashboard.definition;
        definition.queries[query].on_load(function(q) {
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

  self.set_element_id = function(_) {
    element_id = _;
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

  self.set_interactive = function(_) {
    interactive = _;
    return self;
  }

  self.toJSON = function(data_) {
    var data = data_ || {};
    data.item_type = item_type;
    data.query = typeof(query) === 'string' ? query : query.toJSON();
    data.css_class = css_class;
    data.element_id = element_id;
    data.height = height;
    data.style = style;
    return data;
  }

  return self;
}
