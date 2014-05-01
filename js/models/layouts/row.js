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

  d3.rebind(item, base, 'type', 'css_class', 'element_id', 'height', 'style');
  d3.rebind(item, container, 'items', 'add');

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
