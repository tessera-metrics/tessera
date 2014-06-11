/**
 * A property descriptor for building editor property sheets.
 */
ds.property = function(data) {

  var self = limivorous.observable()
                       .property('id')
                       .property('name')
                       .property('type')
                       .property('template')
                       .property('edit_options')
                       .build()
    , default_options = { type: 'text' }

  Object.defineProperty(self, 'is_property', {value: true})

  if (data) {
    self.id = data.id
    self.name = data.name || self.id
    self.type = data.type
    self.edit_options = data.edit_options
    if (typeof(data.template) === 'string') {
      self.template = Handlebars.compile(data.template)
    } else if (data.template && (data.template instanceof Function)) {
      self.template = data.template
    }
  }

  self.render = function(item) {
    var inner = undefined
    if (self.template && (self.template instanceof Function)) {
      inner = self.template({property: self, item: item})
    } else {
      inner = item[self.name] || ''
    }
    return '<span id="' + item.item_id + self.name + '">'
         + inner
         + '</span>'
  }

  self.edit = function(item) {
    var options = {
        type: 'text',
        value: item[self.name] || '',
        success: function(ignore, newValue) {
          item[self.name] = newValue
          ds.manager.update_item_view(item)
        }
    }

    if (self.type === 'boolean') {
      options.type = 'checklist'
      options.source = [
        { value: true, text: self.name }
      ]
      options.success = function(ignore, newValue) {
        item[self.name] = newValue.length > 0
        ds.manager.update_item_view(item)
      }
    } else if (self.type) {
      options.type = self.type
    }

    if (self.edit_options) {
      options = ds.extend(options, self.edit_options)
    }

    if (options.source && (options.source instanceof Function)) {
      options.source = options.source()
    }

    if (options.value && (options.value instanceof Function)) {
      options.value = options.value(item)
    }

    if (options.update && (options.update instanceof Function)) {
      options.success = function(ignore, newValue) {
        options.update(item, newValue)
        ds.manager.update_item_view(item)
      }
    }

    $('#' + item.item_id + self.name).editable(options)

    return self
  }

  return self
}

ds.property.registry = {}

ds.property.register = function(property) {
   if (property instanceof Array) {
     for (var i in property) {
       ds.property.register(property[i])
     }
   } else {
       ds.property.registry[property.id] = property.is_property
                                         ? property
                                         : ds.property(property)
   }
}

ds.property.get = function(id) {
  if (id.is_property)
    return id
  return ds.property.registry[id]
      || ds.property({id: id})
}
