ds.register_dashboard_item('jumbotron_singlestat', {

  display_name: 'Jumbotron Singlestat',
  icon: 'fa fa-subscript',
  category: 'data-table',

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .property('title')
                         .property('units')
                         .property('format', {init: ',.3s'})
                         .property('index')
                         .property('transform', {init: 'mean'})
                         .extend(ds.models.item, {item_type: 'jumbotron_singlestat'})
                         .build()
    Object.defineProperty(self, 'requires_data', {value: true})

    if (data) {
      self.title = data.title
      self.units = data.units
      self.format = data.format || self.format
      self.index = data.index
      self.transform = data.transform || self.transform
    }
    ds.models.item.init(self, data)

    self.toJSON = function() {
      var data = ds.models.item.json(self)
      if (self.title)
        data.title = self.title
      if (self.format)
        data.format = self.format
      if (self.transform)
        data.transform = self.transform
      if (self.units)
        data.units = self.units
      if (self.index)
        data.index = self.index
      return data
    }

    return self
  },

  data_handler: function(query, item) {
    var element = $('#' + item.item_id + ' span.value')
    var value = query.summation[item.transform]
    if (item.index) {
      value = query.data[item.index].summation[item.transform]
    }
    $(element).text(d3.format(item.format)(value))
  },

  template: ds.templates.models.jumbotron_singlestat,

  interactive_properties: [ 'title',
                            'units',
                            'format',
                            { id: 'index', type: 'number' },
                            'transform'
                          ].concat(ds.models.item.interactive_properties)

})
