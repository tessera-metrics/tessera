ds.models.separator = function(data) {
  "use strict";

  var base
    , item = {};

  base = ds.models.item(data);
  base.type('separator');
  item.base = base;

  ds.rebind(item, base, 'type', 'css_class', 'element_id', 'height', 'style');

  item.to_json = function() {
    return base.to_json();
  }

  return item;
};
