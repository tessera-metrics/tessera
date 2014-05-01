ds.models.container = function(data) {
  "use strict";

  var items = []
    , item = {};

  if (data && data.items) {
    items = data.items.map(function(i) {
              return ds.models.factory(i);
            });
  }

  /**
   * Operations
   */

  item.visit = function(visitor) {
    items.forEach(function(item) {
      if (item.visit && typeof(item.visit) == 'function') {
        item.visit(visitor);
      } else {
        visitor(item);
      }
    });
    return item;
  }

  /**
   * Data accessors
   */

  item.items = function(_) {
    if (!arguments.length) return items;
    items = _;
    return item;
  }

  item.add = function(_) {
    items.push(_);
    return item;
  }

  item.toJSON = function(data_) {
    var data = data_ || {};
    data.items = items.map(function(i) {
                   return i.toJSON();
                 });
    return data;
  }

  return item;
}
