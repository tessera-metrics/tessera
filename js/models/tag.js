ds.models.tag = function(data) {
  "use strict";

   var storage = {}
     , self = {}

  limivorous.observable(self, storage)
            .property(self, 'id', storage)
            .property(self, 'href', storage)
            .property(self, 'name', storage)
            .property(self, 'description', storage)
            .property(self, 'color', storage)
            .property(self, 'count', storage)
  Object.defineProperty(self, 'is_tag', {value: true});

  if (data) {
      if (data.is_tag) {
        return data
      } else if (typeof data === 'string') {
        self.name = data
      } else {
        self.id = data.id
        self.href = data.href
        self.name = data.name
        self.description = data.description
        self.color = data.color
        self.count = data.count
      }
  }

  self.toJSON = function() {
    return {
      id: self.id,
      href: self.href,
      name: self.name,
      description: self.description,
      color: self.color,
      count: self.count
    }
  }

  return self
}
