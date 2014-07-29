ds.models.link = function(data) {
  'use strict'

  var self = limivorous.observable()
                       .property('title')
                       .property('href')
                       .build()
  if (data) {
    self.title = data.title
    self.href = data.href
  }

  self.toJSON = function() {
    return {
      title: self.title,
      href: self.href
    }
  }

  return self
}
