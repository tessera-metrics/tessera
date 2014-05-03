ds.models.item = function(data) {
  "use strict";

  var item_type
    , query_name
    , css_class
    , element_id
    , height
    , style
    , interactive // TODO: hack
    , parent
    , self = {};

  if (data) {
    item_type = data.item_type;
    query_name = data.query_name;
    css_class = data.css_class;
    element_id = data.element_id;
    height = data.height;
    style = data.style;
  }

  Object.defineProperty(self, 'item_type', {get: function() { return item_type; }});
  Object.defineProperty(self, 'query_name', {get: function() { return query_name; }});
  Object.defineProperty(self, 'css_class', {get: function() { return css_class; }});
  Object.defineProperty(self, 'element_id', {get: function() { return element_id; }});
  Object.defineProperty(self, 'height', {get: function() { return height; }});
  Object.defineProperty(self, 'style', {get: function() { return style; }});
  Object.defineProperty(self, 'interactive', {get: function() { return interactive; }}); // TODO: hack

  self.rebind = function(target) {
    parent = target;
    d3.rebind(target, self, 'set_type', 'set_query_name', 'set_css_class', 'set_element_id','set_height', 'set_style', 'set_interactive', 'render');
    ds.rebind_properties(target, self, 'item_type', 'query_name', 'css_class', 'element_id', 'height', 'style', 'interactive');
    Object.defineProperty(target, 'base', {value: self});
    return self;
  }

  /**
   * Operations
   */

  self.render = function() {
    var template = ds.templates.models[item_type];
    if (template) {
      if (template.dataHandler && query_name) {
        var definition = cronenberg.dashboards.current.dashboard.definition;
        definition.queries[query_name].on_load(function(query) {
          template.dataHandler(query, parent);
        });
      }
      return template({item: parent});
    } else {
      return "<p>Unknown item type <code>" + item_type + "</code></p>";
    }
  }

  /**
   * Data mutators
   */

  self.set_type = function(_) {
    item_type = _;
    return self;
  }

  self.set_query_name = function(_) {
    query_name = _;
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
    data.query_name = query_name;
    data.css_class = css_class;
    data.element_id = element_id;
    data.height = height;
    data.style = style;
    return data;
  }

  return self;
}
