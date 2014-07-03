/**
 * Mixin for transform types common fields
 */
ds.transform = function(data) {

  var self = {}

  if (data) {
    self.name = data.name
    self.display_name = data.display_name
    self.transform_type = data.transform_type
    self.transform = data.transform
    self.icon = data.icon
  }

  /**
   * Create a UI action object to invoke this transform.
   */
  self.action = function() {
    return ds.action({
      name:    self.name + '_action',
      display: self.display_name + '...',
      icon:    self.icon || 'fa fa-eye',
      hide:    ds.app.Mode.TRANSFORM,
      handler: function(action, item) {
        ds.manager.apply_transform(self, item)
      }
    })
  }

  self.toJSON = function() {
    return {
      name: self.name
    }
  }

  return self
}

ds.transforms = ds.registry({
  name: 'transforms',
  process: function(data) {
    var transform = ds.transform(data)
    var action_category = transform.transform_type + '-transform-actions'
    ds.actions.register(action_category, transform.action())
    return transform
  }
})
