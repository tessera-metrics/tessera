ds.models.container = function(data) {
  "use strict";

  var items = []
    , item = {};

  if (data && data.items) {
    items = data.items.map(function(i) {
              return ds.models.factory(i);
            });
  }

  item.items = function(_) {
    if (!arguments.length) return items;
    items = _;
    return item;
  }

  item.add = function(_) {
    items.push(_);
    return item;
  }

  item.to_json = function(data_) {
    var data = data_ || {};
    data.items = items.map(function(i) {
                   return i.to_json();
                 });
    return data;
  }

  return item;
}
