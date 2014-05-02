ds.models.separator = function(data) {
  "use strict";

  var base
    , item = {};

  base = ds.models.item(data).set_type('separator').rebind(item);

  item.toJSON = function() {
    return base.toJSON();
  }

  return item;
};
