/**
 * A property descriptor for building editor property sheets.
 */
ds.models.property = function(data) {

  var self = limivorous.observable()
                       .property('name')
                       .property('display')
                       .property('type')
                       .property('template')
                       .build()

  if (data) {
    self.name = data.name
    self.display = data.display
    if (self.name && !self.display)
      self.display = self.name
    self.type = data.type
    self.template = data.template
  }

  self.render = function(item) {
    var template = self.template || ds.templates.edit.properties[self.name]
    var inner = undefined
    if (template && template instanceof Function) {
      inner = template({property: self, item: item})
    } else {
      inner = item[self.display] || ''
    }
    return '<span id="' + item.item_id + self.name + '">'
         + inner
         + '</span>'
  }

  return self
}
