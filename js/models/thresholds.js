ds.models.thresholds = function(data) {
  "use strict";

  var summation_type = 'mean'
    , warning
    , danger
    , self = {};

  if (data) {
    summation_type = data.summation_type  || summation_type;
    warning = data.warning;
    danger = data.danger;
  }

  Object.defineProperty(self, 'summation_type', {get: function() { return summation_type; }});
  Object.defineProperty(self, 'warning', {get: function() { return warning; }});
  Object.defineProperty(self, 'danger', {get: function() { return danger; }});

  self.set_summation_type = function(_) {
    summation_type = _;
    return self;
  }

  self.set_warning = function(_) {
    warning = _;
    return self;
  }

  self.set_danger = function(_) {
    danger = _;
    return self;
  }

  self.toJSON = function() {
    return {
      summation_type: summation_type,
      warning: warning,
      danger: danger
    }
  }

  return self;
}
