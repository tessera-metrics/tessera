ds.register_dashboard_item('section', {

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .property('title')
                         .property('layout', {init: 'fixed'})
                         .extend(ds.models.item, {item_type: 'section'})
                         .extend(ds.models.container)
                       .build()

    if (data) {
      self.layout = data.layout || layout
      self.title = data.title
    }
    ds.models.item.init(self, data)
    ds.models.container.init(self, data)

    self.toJSON = function() {
      var data = ds.models.container.json(self, ds.models.item.json(self))
      if (self.layout)
        data.layout = self.layout
      if (self.title)
        data.title = self.title
      return data
    }

    return self
  },

  template: ds.templates.models.section,

  interactive_properties: [ { id: 'layout',
                              type: 'select',
                              edit_options: {
                                source: [
                                  'fixed',
                                  'fluid',
                                  'none'
                                ]
                              }
                            },
                            'style',
                            'css_class',
                            'title'
                          ]
})
