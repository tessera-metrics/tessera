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

  /**
   * Operations
   */

  item.visit = function(visitor) {
    container.visit(visitor);
    return item;
  }

  /**
   * Data accessors
   */

  item.toJSON = function() {
    return container.toJSON(base.toJSON());
  }

  return item;
};
