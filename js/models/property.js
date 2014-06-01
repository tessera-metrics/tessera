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
    console.log('property.render() - ' + self.name + '/' + item)
    var template = ds.templates.properties[self.name]
    if (template) {
      return template({property: self, item: item})
    } else {
      return "<p>Unknown property <code>" + self.name + "</code></p>"
    }
  }

  // TODO:
  //  - render: return a property sheet row
  //  - update: validate & set the value on a target object

  return self
}
