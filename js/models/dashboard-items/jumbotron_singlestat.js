ds.models.jumbotron_singlestat = function(data) {
  'use strict'

  var self = limivorous.observable()
                       .property('title')
                       .property('units')
                       .property('format', {init: ',.3f'})
                       .property('index')
                       .property('transform', {init: 'mean'})
                       .extend(ds.models.item, {item_type: 'jumbotron_singlestat'})
                       .build()
  Object.defineProperty(self, 'requires_data', {value: true})

  if (data) {
    self.title = data.title
    self.units = data.units
    self.format = data.format || self.format
    self.index = data.index
    self.transform = data.transform || self.transform
  }
  ds.models.item.init(self, data)

  self.interactive_properties = function() {
    return ['title', 'units', 'format', 'index', 'transform']
             .concat(ds.models.item.interactive_properties())
  }

 self.toJSON = function() {
   var data = ds.models.item.json(self)
   if (self.title)
     data.title = self.title
   if (self.format)
     data.format = self.format
   if (self.transform)
     data.transform = self.transform
   if (self.units)
     data.units = self.units
   if (self.index)
     data.index = self.index
   return data
 }

  return self
}
