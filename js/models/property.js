/**
 * A property descriptor for building editor property sheets.
 */
ds.models.property = function(data) {

  var self = limivorous.observable()
                       .property('name')
                       .property('display')
                       .property('type')
                       .build()

  if (data) {
    self.name = data.name
    self.display = data.display
    self.type = data.type
  }

  self.render = function(item) {
    var template = ds.templates.edit.properties[self.name]
    if (template) {
      return template({property: self, item: item})
    } else {
      return "<p>Unimplemented property <code>" + self.name + "</code></p>"
    }
  }

  // TODO:
  //  - update: validate & set the value on a target object

  return self
}
