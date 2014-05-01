ds.models.section = function(data) {
  "use strict";

  var layout = 'fixed'
    , container
    , base
    , item = {};

  if (data) {
    layout = data.layout || layout;
  }
  base = ds.models.item(data);
  container = ds.models.container(data);

  base.type('section');
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

  item.layout = function(_) {
    if (!arguments.length) return layout;
    layout = _;
    return item;
  }

  item.toJSON = function() {
    return container.toJSON(base.toJSON({
      layout: layout
    }));
  }

  return item;
};
