ds.models.simple_time_series = function(data) {
  'use strict';

  var self = limivorous.observable()
                       .extend(ds.models.item, {item_type: 'simple_time_series'})
                       .extend(ds.models.chart)
                       .property('filled', {init: false})
                       .build()

  if (data) {
    self.filled = data.filled !== false
  }
  ds.models.chart.init(self, data)
  ds.models.item.init(self, data)

  self.interactive_properties = function() {
    return [
      ds.models.property({name: 'title'}),
      ds.models.property({name: 'filled'})
    ].concat(ds.models.chart.interactive_properties(),
             ds.models.item.interactive_properties())
  }

  self.toJSON = function() {
    return ds.models.chart.json(self, ds.models.item.json(self, {
      filled: self.filled
    }))
  }

  return self
}
