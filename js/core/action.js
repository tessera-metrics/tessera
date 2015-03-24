/**
 * A model object describing a user-interface action. Actions may be
 * rendered as either a menu item in a dropdown or a button in a
 * button bar.
 *
 * actions - a list of additional actions, causing this action to be
 *           rendered as a dropdown button or sub-menu.
 * icon - CSS classes to render a Font Awesome icon.
 * handler - callback function to run when the action is invoked.
 * category - action category to register this action in .
 * divider - if true, this action will simply render as a divider between action groups.
 */
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
