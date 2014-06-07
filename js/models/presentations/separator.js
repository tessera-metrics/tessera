ds.models.separator = function(data) {
  'use strict'

  var self = limivorous.observable()
                       .extend(ds.models.item, {item_type: 'separator'})
                       .build()

  ds.models.item.init(self, data)

  self.interactive_properties = function() {
    return [
      ds.models.property({name: 'css_class'})
    ]
  }

  self.toJSON = function() {
    return ds.models.item.json(self)
  }

  return self
}
