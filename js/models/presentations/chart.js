ds.models.chart = function(data) {
  "use strict";

  var title
    , options = {}
    , item = {};

  if (data) {
    title = data.title;
    options = data.options || options;
  }

  Object.defineProperty(item, 'title', {get: function() { return title; }});
  Object.defineProperty(item, 'options', {get: function() { return options; }});

  item.rebind = function(target) {
    d3.rebind(target, item, 'set_title', 'set_options');
    ds.rebind_properties(target, item, 'title', 'options');
    return item;
  }

  /**
   * Data mutators
   */

  item.set_title = function(_) {
    title = _;
    return item;
  }

  item.set_options = function(_) {
    options = _;
    return item;
  }

  item.toJSON = function(data_) {
    var data = data_ || {};
    data.title = title;
    data.options = options;
    return data;
  }

  return item;
}
