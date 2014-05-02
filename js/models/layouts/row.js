ds.models.row = function(data) {
  "use strict";

  var base
    , container
    , item = {};

  base = ds.models.item(data).set_type('row').rebind(item);
  container = ds.models.container(data).rebind(item);

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
