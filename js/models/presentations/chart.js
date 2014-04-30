/**
 * Mirrors cronenberg.model.web.summation_table
 */
ds.models.chart = function(data) {
  "use strict";

  var title
    , options = {}
    , item = {};

  if (data) {
    title = data.title;
    options = data.options || options;
  }

  item.title = function(_) {
    if (!arguments.length) return title;
    title = _;
    return item;
  }

  item.options = function(_) {
    if (!arguments.length) return options;
    options = _;
    return item;
  }

  item.to_json = function(data_) {
    var data = data_ || {};
    data.title = title;
    data.options = options;
    return data;
  }

  return item;
}
