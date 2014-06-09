ds.models.summation_table = function(data) {
  'use strict'

  var self = limivorous.observable()
                       .property('striped', {init: false})
                       .property('format', {init: ',.3f'})
                       .extend(ds.models.item, {item_type: 'summation_table'})
                       .build()
  Object.defineProperty(self, 'requires_data', {value: true})

  if (data) {
    self.striped = data.striped !== false
    self.title = data.title
    self.format = data.format || self.format
  }
  ds.models.item.init(self, data)

  self.interactive_properties = function() {
    return ['striped', 'format']
             .concat(ds.models.item.interactive_properties())
  }

  self.toJSON = function() {
    var data = ds.models.item.json(self)
    if (self.format)
      data.format = self.format
    if (self.striped)
      data.striped = self.striped
    if (self.title)
      data.title = self.title
    return data
  }

  return self
}
