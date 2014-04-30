ds.models.row = function(data) {
  "use strict";

  var base
    , container
    , item = {};

  base = ds.models.item(data);
  container = ds.models.container(data);

  base.type('row');
  item.base = base;
  item.container = container;

  ds.rebind(item, base, 'type', 'css_class', 'element_id', 'height', 'style');
  ds.rebind(item, container, 'items', 'add');

  item.to_json = function() {
    return container.to_json(base.to_json());
  }

  return item;
};
