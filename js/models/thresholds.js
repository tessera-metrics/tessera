ds.models.thresholds = function(data) {
  "use strict";

  var storage = {}
    , self = {}

  limivorous.observable(self, storage)
            .property(self, 'summation_type', storage)
            .property(self, 'warning', storage)
            .property(self, 'danger', storage)

  if (data) {
    self.summation_type = data.summation_type  || 'mean'
    self.warning = data.warning
    self.danger = data.danger
  }

  self.toJSON = function() {
    return {
      summation_type: self.summation_type,
      warning: self.warning,
      danger: self.danger
    }
  }

  return self
}
