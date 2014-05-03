ds.models.container = function(data) {
  "use strict";

  var items = []
    , self = {};

  if (data && data.items) {
    items = data.items.map(function(i) {
              return ds.models.factory(i);
            });
  }

  Object.defineProperty(self, 'items', {get: function() { return items; }});
  Object.defineProperty(self, 'length', {get: function() { return items.length; }});

  self.rebind = function(target) {
    d3.rebind(target, self, 'set_items', 'add');
    ds.rebind_properties(target, self, 'items', 'length');
    Object.defineProperty(target, '_container', {value: self});
    Object.defineProperty(target, 'is_container', {value: true});
    return self;
  }

  /**
   * Operations
   */

  self.visit = function(visitor) {
    items.forEach(function(item) {
      if (item.visit && typeof(item.visit) == 'function') {
        item.visit(visitor);
      } else {
        visitor(item);
      }
    });
    return self;
  }

  /**
   * Data accessors
   */

  self.set_items = function(_) {
    items = _;
    return self;
  }

  self.add = function(_) {
    items.push(_);
    return self;
  }

  self.toJSON = function(data_) {
    var data = data_ || {};
    data.items = items.map(function(i) {
                   return i.toJSON();
                 });
    return data;
  }

  return self;
}
