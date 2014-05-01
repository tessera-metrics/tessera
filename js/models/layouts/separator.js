ds.models.separator = function(data) {
  "use strict";

  var base
    , item = {};

  base = ds.models.item(data);
  base.type('separator');
  item.base = base;

  d3.rebind(item, base, 'type', 'css_class', 'element_id', 'height', 'style');

  item.toJSON = function() {
    return base.toJSON();
  }

  return item;
};
