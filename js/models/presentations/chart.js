ds.models.chart = function(data) {
  "use strict";

  var title
    , options = {}
    , self = {};

  if (data) {
    title = data.title;
    options = data.options || options;
  }

  Object.defineProperty(self, 'title', {get: function() { return title; }});
  Object.defineProperty(self, 'options', {get: function() { return options; }});

  self.rebind = function(target) {
    d3.rebind(target, self, 'set_title', 'set_options');
    ds.rebind_properties(target, self, 'title', 'options');
    return self;
  }

  /**
   * Data mutators
   */

  self.set_title = function(_) {
    title = _;
    return self;
  }

  self.set_options = function(_) {
    options = _;
    return self;
  }

  self.toJSON = function(data_) {
    var data = data_ || {};
    data.title = title;
    data.options = options;
    return data;
  }

  return self;
}
