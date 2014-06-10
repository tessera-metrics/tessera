ds.register_dashboard_item('section', {

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .property('layout', {init: 'fixed'})
                         .extend(ds.models.item, {item_type: 'section'})
                         .extend(ds.models.container)
                       .build()

    if (data) {
      self.layout = data.layout || layout
    }
    ds.models.item.init(self, data)
    ds.models.container.init(self, data)

    self.toJSON = function() {
      var data = ds.models.container.json(self, ds.models.item.json(self))
      if (self.layout)
        data.layout = self.layout
      return data
    }

    return self
  },

  template: ds.templates.models.section,

  interactive_properties: [ { id: 'layout',
                              type: 'select',
                              edit_options: {
                                source: [
                                  { value: 'fixed', text: 'fixed' },
                                  { value: 'fluid', text: 'fluid' },
                                  { value: 'none', text: 'none' }
                                ]
                              }
                            },
                            'style',
                            'css_class'
                          ]
})
