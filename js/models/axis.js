ds.models.Axis = function(data) {
  'use strict'

  var self = limivorous.observable()
                       .property('label')
                       .property('format')
                       .property('min')
                       .property('max')
                       .build()

  Object.defineProperty(self, 'is_axis', {value: true})

  if (data) {
    self.label = data.label
    self.format = data.format
    self.min = data.min
    self.max = data.max
  }

  self.toJSON = function() {
    return {
      label: self.label,
      format: self.format,
      min: self.min,
      max: self.max
    }
  }

  return self
}
