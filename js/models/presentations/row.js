ds.models.row = function(data) {
  "use strict";

  var base
    , container
    , self = {};

  base = ds.models.item(data).set_item_type('row').rebind(self);
  container = ds.models.container(data).rebind(self);

  /**
   * Operations
   */

  self.visit = function(visitor) {
    container.visit(visitor);
    return self;
  }

  /**
   * Data accessors
   */

  self.toJSON = function() {
    return container.toJSON(base.toJSON());
  }

  return self;
};
