ds.models.thresholds = function(data) {
  "use strict";

  var storage = {}
    , self = {}

  limivorous.observable(self, storage)
            .property('summation_type')
            .property('warning')
            .property('danger')

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
