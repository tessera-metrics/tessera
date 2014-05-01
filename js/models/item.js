ds.models.item = function(data) {
  "use strict";

  var item_type
    , css_class
    , element_id
    , height
    , style
    , item = {};

  if (data) {
    item_type = data.item_type;
    css_class = data.css_class;
    element_id = data.element_id;
    height = data.height;
    style = data.style;
  }

  Object.defineProperty(item, 'item_type', {get: function() { return item_type; }});
  Object.defineProperty(item, 'css_class', {get: function() { return css_class; }});
  Object.defineProperty(item, 'element_id', {get: function() { return element_id; }});
  Object.defineProperty(item, 'height', {get: function() { return height; }});
  Object.defineProperty(item, 'style', {get: function() { return style; }});

  item.rebind = function(target) {
    d3.rebind(target, item, 'set_type', 'set_css_class', 'set_element_id','set_height', 'set_style');
    ds.rebind_properties(target, item, 'item_type', 'css_class', 'element_id', 'height', 'style');
    return item;
  }

  item.set_type = function(_) {
    item_type = _;
    return item;
  }

  item.set_css_class = function(_) {
    css_class = _;
    return item;
  }

  item.set_element_id = function(_) {
    element_id = _;
    return item;
  }

  item.set_height = function(_) {
    height = _;
    return item;
  }

  item.set_style = function(_) {
    style = _;
    return item;
  }

  item.toJSON = function(data_) {
    var data = data_ || {};
    data.item_type = item_type;
    data.css_class = css_class;
    data.element_id = element_id;
    data.height = height;
    data.style = style;
    return data;
  }

  return item;
}
