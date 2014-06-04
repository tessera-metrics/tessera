ds.models.markdown = function(data) {
  "use strict";

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
    return [
      ds.models.property({name: 'text'})
    ].concat(ds.models.item.interactive_properties())
  }

  self.interactive_properties = function() {
    return ['title', 'markdown_text', 'css_class', 'style', 'height'].map(function(name) {
             return ds.models.property({name: name})
           })
  }

  self.toJSON = function() {
    return ds.models.item.json(self, {
      text: self.text,
      raw: self.raw
    })
  }

  return self
}
