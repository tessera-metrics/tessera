ds.models.dashboard_definition = function(data) {
  "use strict";

  var container
    , base
    , item = {};

  base = ds.models.item(data);
  container = ds.models.container(data);

  base.type('dashboard');
  item.base = base;
  item.container = container;

  ds.rebind(item, base, 'type', 'css_class', 'element_id', 'height', 'style');
  ds.rebind(item, container, 'items', 'add');

  item.toJSON = function() {
    return container.toJSON(base.toJSON());
  }

  return item;
};
