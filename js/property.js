/**
 * A property descriptor for building editor property sheets.
 */
ds.property = function(data) {

  var self = limivorous.observable()
                       .property('id')
                       .property('name')
                       .property('category')
                       .property('type')
                       .property('template')
                       .property('edit_options')
                       .build()
    , default_options = { type: 'text' }

  Object.defineProperty(self, 'is_property', {value: true})

  if (data) {
    self.id = data.id
    self.name = data.name || self.id
    self.category = data.category
    self.type = data.type
    self.edit_options = data.edit_options
    if (typeof(data.template) === 'string') {
      self.template = Handlebars.compile(data.template)
    } else if (data.template && (data.template instanceof Function)) {
      self.template = data.template
    }
  }

  /**
   * Render the basic display of the property's value.
   */
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

  /**
   * Make the property editable by transforming its value display into
   * an in-line edit widget.
   */
  self.edit = function(item) {
    var default_options = {
        type: 'text',
        value: item[self.name] || '',
        success: function(ignore, newValue) {
          item[self.name] = newValue
          ds.manager.update_item_view(item)
        }
    }
    var options = ds.extend(default_options, self.edit_options)

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

    if (self.type === 'select' && (options.source instanceof Array)) {
      options.source = options.source.map(function(value) {
                         if ( value instanceof String ) {
                           return { value: value, text: value }
                         } else if (typeof(value) === 'undefined') {
                           return { value: undefined, text: 'none' }
                         } else {
                           return value
                         }
                       })
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

/**
 * An object to allow lookup of properties by id, for easy sharing of
 * property definitions.
 */
ds.property.registry = {}

/**
 * Registry a property or array of properties in the global registry.
 */
ds.property.register = function(property) {
   if (property instanceof Array) {
     for (var i = 0; i < property.length; i++) {
       ds.property.register(property[i])
     }
   } else {
     ds.property.registry[property.id] = property.is_property
                                       ? property
                                       : ds.property(property)
   }
}

/**
 * Normalize a property object or string ID.
 *
 * @param property_or_id A string ID of a property, or a property
 *                       object
 * @return A ds.property object. If the argument was already a
 *         property instance, it is returned unmodified.
 */
ds.property.get = function(property_or_id) {
  if (property_or_id.is_property)
    return property_or_id
  return ds.property.registry[property_or_id]
      || ds.property({id: property_or_id})
}
