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
    self.is_action = true
  }

  self.toJSON = function() {
    return {
      name: self.name,
      category: self.category,
      show: self.show,
      hide: self.hide,
      class: self.class,
      options: self.options
    }
  }

  return self
}

ds.action.divider = ds.action({divider:true})

ds.actions = ds.registry({
  name: 'actions',
  process: function(data) {
    if (data.is_action)
      return data
    return ds.action(data)
  }
})
