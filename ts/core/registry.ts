/**
 * A simple registry for organizing and retrieving ordered sets of
 * named objects. Each registry instance organizes its values into
 * categories, allowing retrieval of individual values by name, or
 * lists of values by category.
 *
 * Objects stored in a registry must have a 'name' property.
 */
ds.registry = function(init) {
  'use strict'

  var data : any = {}
    , self : any = {}
    , DEFAULT_CATEGORY = 'default'

  if (init) {
    self.name = init.name
    self.process = init.process
  }

  function get_data(category) {
    if (typeof(data[category]) === 'undefined') {
      data[category] = {
        list: [],
        index: {}
      }
    }
    return data[category]
  }

  /**
   * Add a named object to the registry. If no category name is
   * supplied, it will be assigned to the default category.
   */
  self.register = function(category, thing) {
    if (arguments.length === 1) {
      thing = category
      category = DEFAULT_CATEGORY
    }
    if (thing instanceof Array) {
      for (var i = 0; i < thing.length; i++) {
        self.register(category, thing[i])
      }
    } else {
      var category_data = get_data(category)
      if (self.process && self.process instanceof Function) {
        thing = self.process(thing)
      }
      if (typeof(category_data.index[thing.name]) === 'undefined') {
        category_data.index[thing.name] = thing
      }
      category_data.list.push(thing)
    }
    return self
  }

  /**
   * Return a list of all values assigned to the named category. If no
   * category name is supplied, the values assigned to the default
   * category will be returned.
   */
  self.list = function(category) {
    if (arguments.length === 0)
      category = DEFAULT_CATEGORY
    return get_data(category).list
  }

  /**
   * Retrieve a single value from a category by name. If only a name
   * is supplied, the default category will be used.
   */
  self.get = function(category, name) {
    if (arguments.length === 1) {
      name = category
      category = DEFAULT_CATEGORY
    }
    return get_data(category).index[name]
  }

  /**
   * Return a list of all registered categories.
   */
  self.categories = function() {
    return Object.keys(data)
  }

  return self
}
