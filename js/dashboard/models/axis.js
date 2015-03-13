ds.models.Axis = function(data) {
  'use strict'

  var self = limivorous.observable()
                       .property('visible')
                       .property('label')
                       .property('label_distance')
                       .property('format')
                       .property('min')
                       .property('max')
                       .build()

  Object.defineProperty(self, 'is_axis', {value: true})

  if (data) {
    self.value = data.visible
    self.label = data.label
    self.label_distance = data.label_distance
    self.format = data.format
    self.min = data.min
    self.max = data.max
  }

  self.toJSON = function() {
    return {
      visible: self.visible,
      label: self.label,
      label_distance: self.label_distance,
      format: self.format,
      min: self.min,
      max: self.max
    }
  }

  return self
}
