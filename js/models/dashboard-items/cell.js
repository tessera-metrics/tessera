ds.register_dashboard_item('cell', {

  display_name: 'Cell',
  category: 'structural',

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .extend(ds.models.item, {item_type: 'cell'})
                         .extend(ds.models.container)
                         .property('span', { init: 3 })
                         .property('offset')
                         .property('align')
                         .build()

    if (data) {
      self.span = data.span || self.span
      self.offset = data.offset
      self.align = data.align
    }
    ds.models.item.init(self, data)
    ds.models.container.init(self, data)

    self.toJSON = function() {
      var data = ds.models.container.json(self, ds.models.item.json(self))
      if (self.span)
        data.span = self.span
      if (self.offset)
        data.offset = self.offset
      if (self.align)
      data.align = self.align
      return data
    }

    return self
  },

  template: ds.templates.models.cell,

  interactive_properties: [
    'style',
    'css_class',
    { id: 'span', type: 'number' },
    { id: 'offset', type: 'number' },
    {
      id: 'align',
      type: 'select',
      edit_options: {
        source: [
          undefined,
          'left',
          'center',
          'right'
        ]
      }
    }
  ]

})
