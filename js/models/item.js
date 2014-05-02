ds.models.item = function(data) {
  "use strict";

  var item_type
    , css_class
    , element_id
    , height
    , style
    , self = {};

  if (data) {
    item_type = data.item_type;
    css_class = data.css_class;
    element_id = data.element_id;
    height = data.height;
    style = data.style;
  }

  Object.defineProperty(self, 'item_type', {get: function() { return item_type; }});
  Object.defineProperty(self, 'css_class', {get: function() { return css_class; }});
  Object.defineProperty(self, 'element_id', {get: function() { return element_id; }});
  Object.defineProperty(self, 'height', {get: function() { return height; }});
  Object.defineProperty(self, 'style', {get: function() { return style; }});

  self.rebind = function(target) {
    d3.rebind(target, self, 'set_type', 'set_css_class', 'set_element_id','set_height', 'set_style');
    ds.rebind_properties(target, self, 'item_type', 'css_class', 'element_id', 'height', 'style');
    return self;
  }

  self.set_type = function(_) {
    item_type = _;
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

  self.toJSON = function(data_) {
    var data = data_ || {};
    data.item_type = item_type;
    data.css_class = css_class;
    data.element_id = element_id;
    data.height = height;
    data.style = style;
    return data;
  }

  return self;
}
