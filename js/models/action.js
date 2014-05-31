ds.models.action = function(data) {

  var self = limivorous.observable()
                       .property('name')
                       .property('display')
                       .property('icon')
                       .property('show')
                       .property('hide')
                       .property('class')
                       .property('options')
                       .property('handler')
                       .property('divider')
                       .build()

  if (data) {
    self.name = data.name
    self.display = data.display
    self.icon = data.icon
    self.options = data.options
    self.handler = data.handler
    self.show = data.show
    self.hide = data.hide
    self.divider = data.divider
    self.class = data.class
  }

  return self
}
