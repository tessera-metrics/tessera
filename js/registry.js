/**
 * A simple registry for organizing and retrieving ordered sets of
 * named things.
 */
ds.registry = function(init) {
  'use strict'

  var data = {}
    , self = {}
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

  self.list = function(category) {
    if (arguments.length === 0)
      category = DEFAULT_CATEGORY
    return get_data(category).list
  }

  self.get = function(category, name) {
    if (arguments.length === 1) {
      name = category
      category = DEFAULT_CATEGORY
    }
    return get_data(category).index[name]
  }

  self.categories = function() {
    return Object.keys(data)
  }

  return self
}
