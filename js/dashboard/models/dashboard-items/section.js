ds.register_dashboard_item('section', {

  display_name: 'Section',
  category: 'structural',

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .property('title')
                         .property('description')
                         .property('level', {init: 1})
                         .property('horizontal_rule', {init: true})
                         .property('layout', {init: 'fixed'})
                         .extend(ds.models.item, {item_type: 'section'})
                         .extend(ds.models.container)
                       .build()

    if (data) {
      self.title = data.title
      self.description = data.description
      self.level = data.level || self.level
      if (typeof(data.horizontal_rule !== 'undefined'))
        self.horizontal_rule = Boolean(data.horizontal_rule)
      self.layout = data.layout || self.layout
    }
    ds.models.item.init(self, data)
    ds.models.container.init(self, data)

    self.toJSON = function() {
      var data = ds.models.container.json(self, ds.models.item.json(self))
      if (self.title)
        data.title = self.title
      if (self.description)
        data.description = self.description
      data.level = self.level
      data.horizontal_rule = self.horizontal_rule
      if (self.layout)
        data.layout = self.layout
      return data
    }

    return self
  },

  template: ds.templates.models.section,

  interactive_properties: [
    { id: 'layout',
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
    'title',
    'description',
    { id: 'level', type: 'number' },
    { id: 'horizontal_rule', type: 'boolean' }
  ]
})
