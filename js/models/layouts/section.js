ds.models.section = function(data) {
  "use strict";

  var layout = 'fixed'
    , container
    , base
    , item = {};

  if (data) {
    layout = data.layout || layout;
  }
  base = ds.models.item(data).set_type('section').rebind(item);
  container = ds.models.container(data).rebind(item);

  Object.defineProperty(item, 'layout', {get: function() { return layout; }});

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

  item.set_layout = function(_) {
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
