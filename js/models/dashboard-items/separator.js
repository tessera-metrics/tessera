ds.register_dashboard_item('separator', {

  display_name: 'Separator',
  icon: 'fa fa-arrows-h',
  category: 'display',

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .extend(ds.models.item, {item_type: 'separator'})
                         .build()

    ds.models.item.init(self, data)

    self.toJSON = function() {
      return ds.models.item.json(self)
    }

    return self
  },

  template: ds.templates.models.separator,

  interactive_properties: [ 'css_class' ]

})
