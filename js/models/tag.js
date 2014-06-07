ds.models.tag = function(data) {
  "use strict"

  var self = limivorous.observable()
                       .property('id')
                       .property('href')
                       .property('name')
                       .property('description')
                       .property('color')
                       .property('count')
                       .build()
  Object.defineProperty(self, 'is_tag', {value: true})

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
    var json = {}
    if (self.id)
      json.id = self.id
    if (self.href)
      json.href = self.href
    if (self.name)
      json.name = self.name
    if (self.description)
      json.description = self.description
    if (self.color)
      json.color = self.color
    if (self.count)
      json.count = self.count
    return json
  }

  return self
}
