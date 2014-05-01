/**
 * Mirrors cronenberg.model.web.DashboardItem on the server.
 */
ds.models.item = function(data) {
  "use strict";

  var item_type
    , css_class
    , element_id
    , height
    , style
    , item = {};

  if (data) {
    item_type = data.item_type || item_type;
    css_class = data.css_class || css_class;
    element_id = data.element_id || element_id;
    height = data.height || height;
    style = data.style || style;
  }

  item.type = function(_) {
    if (!arguments.length) return item_type;
    item_type = _;
    return item;
  }

  item.css_class = function(_) {
    if (!arguments.length) return css_class;
    css_class = _;
    return item;
  }

  item.element_id = function(_) {
    if (!arguments.length) return element_id;
    element_id = _;
    return item;
  }

  item.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return item;
  }

  item.style = function(_) {
    if (!arguments.length) return style;
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
