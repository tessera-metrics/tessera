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

  Object.defineProperty(item, 'summation_type', {get: function() { return summation_type; }});
  Object.defineProperty(item, 'warning', {get: function() { return warning; }});
  Object.defineProperty(item, 'danger', {get: function() { return danger; }});

  item.set_summation_type = function(_) {
    summation_type = _;
    return item;
  }

  item.set_warning = function(_) {
    warning = _;
    return item;
  }

  item.set_danger = function(_) {
    danger = _;
    return item;
  }

  item.toJSON = function() {
    return {
      summation_type: summation_type,
      warning: warning,
      danger: danger
    }
  }

  return item;
}
