ds.action = function(data) {

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
                       .property('actions')
                       .property('category')
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
    self.actions = data.actions
    self.category = data.category
  }

  return self
}

ds.action.divider = ds.action({divider:true})

ds.action.registry = {}

ds.action._get_actions = function(category) {
  var actions = ds.action.registry
  if (typeof(actions[category]) === 'undefined') {
    actions[category] = {
      list: [],
      index: {}
    }
  }
  return actions[category]
}

ds.action.register = function(category, action) {
    if (action instanceof Array) {
      for (var i in action) {
        ds.action.register(category, action[i])
      }
    } else {
      var a = ds.action._get_actions(category)
      if (typeof(a.index[action.name]) === 'undefined') {
        a.index[action.name] = action
      }
      a.list.push(action)
    }
  return ds.action
}

ds.action.list = function(category) {
  return ds.action._get_actions(category).list
}

ds.action.get = function(category, name) {
  return ds.action._get_actions(category).index[name]
}

ds.action.categories = function() {
  return Object.keys(ds.action.registry)
}
