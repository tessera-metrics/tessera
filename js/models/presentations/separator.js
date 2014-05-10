ds.models.separator = function(data) {
  "use strict";

  var base
    , self = {};

  base = ds.models.item(data).set_item_type('separator').rebind(self);

  self.toJSON = function() {
    return base.toJSON();
  }

  return self;
};
