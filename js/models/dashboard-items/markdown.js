ds.register_dashboard_item('markdown', {
  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .property('text')
                         .property('raw', {init: false})
                         .extend(ds.models.item, {item_type: 'markdown'})
                         .build()

    if (data) {
      self.text = data.text
      if (data.raw !== undefined) {
        self.raw = data.raw
      }
    }
    ds.models.item.init(self, data)

    self.toJSON = function() {
      return ds.models.item.json(self, {
        text: self.text,
        raw: self.raw
      })
    }

    return self
  },

  template: ds.templates.models.markdown,

  interactive_properties: [
    {
      id: 'markdown.text',
      type: 'textarea',
      name: 'text'
    },
    { id: 'height', type: 'number' },
    'css_class'
  ]

})
