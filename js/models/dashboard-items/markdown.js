ds.models.markdown = function(data) {
  'use strict'

  var self = limivorous.observable()
                       .property('text')
                       .property('raw', {init: false})
                       .extend(ds.models.item, {item_type: 'markdown'})
                       .build()

  if (data) {
    self.text = data.text
    if (data.raw !== undefined) {
      self.raw = data.raw
    }
  }
  ds.models.item.init(self, data)

  self.interactive_properties = function() {
    return [ 'markdown.text', 'height', 'css_class' ]
  }

  self.toJSON = function() {
    return ds.models.item.json(self, {
      text: self.text,
      raw: self.raw
    })
  }

  return self
}
