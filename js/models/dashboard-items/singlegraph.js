ds.models.singlegraph = function(data) {
  'use strict'

  var self = limivorous.observable()
                       .property('format', {init: ',.1s'})
                       .property('transform', {init: 'mean'})
                       .extend(ds.models.item, {item_type: 'singlegraph'})
                       .extend(ds.models.chart)
                       .build()

  if (data) {
    self.format = data.format || self.format
    self.transform = data.transform || self.transform
  }
  ds.models.chart.init(self, data)
  ds.models.item.init(self, data)
  if (!self.height) {
    self.height = 1
  }

  self.interactive_properties = function() {
    return ['format', 'transform'].map(function(name) {
             return ds.models.property({name: name})
           }).concat(ds.models.chart.interactive_properties(),
                     ds.models.item.interactive_properties())
  }

 self.toJSON = function() {
   return ds.models.chart.json(self, ds.models.item.json(self, {
     format: self.format,
     transform: self.transform
   }))
 }
  return self
}
