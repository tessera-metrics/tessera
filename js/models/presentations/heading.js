ds.models.heading = function(data) {
  "use strict";

  var self = limivorous.observable()
                       .property('text')
                       .property('level', {init: 1})
                       .property('description')
                       .extend(ds.models.item, {item_type: 'heading'})
                       .build()
  if (data) {
    self.text = data.text;
    self.level = data.level || self.level;
    self.description = data.description;
  }
  ds.models.item.init(self, data)

  self.toJSON = function() {
    var data = ds.models.item.json(self)
    if (self.text)
      data.text = self.text
    if (self.level)
      data.level = self.level
    if (self.description)
      data.description = self.description
    return data
  }

  return self
}
