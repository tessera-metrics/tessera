ds.models.thresholds = function(data) {
  "use strict";

  var summation_type = 'mean'
    , warning
    , danger
    , item = {};

  if (data) {
    summation_type = data.summation_type  || summation_type;
    warning = data.warning;
    danger = data.danger;
  }

  item.summation_type = function(_) {
    if (!arguments.length) return summation_type;
    summation_type = _;
    return item;
  }

  item.warning = function(_) {
    if (!arguments.length) return warning;
    warning = _;
    return item;
  }

  item.danger = function(_) {
    if (!arguments.length) return danger;
    danger = _;
    return item;
  }

  item.to_json = function() {
    return {
      summation_type: summation_type,
      warning: warning,
      danger: danger
    }
  }

  return item;
}
