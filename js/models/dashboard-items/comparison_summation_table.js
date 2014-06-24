ds.register_dashboard_item('comparison_summation_table', {

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .property('striped', {init: false})
                         .property('format', {init: ',.3s'})
                         .property('title')
                         .property('query2')
                         .extend(ds.models.item, {item_type: 'comparison_summation_table'})
                         .build()
    Object.defineProperty(self, 'requires_data', {value: true})

    if (data) {
      self.striped = data.striped !== false
      self.title = data.title
      self.format = data.format || self.format
      self.query2 = data.query2
    }
    ds.models.item.init(self, data)

    self.toJSON = function() {
      var data = ds.models.item.json(self)
      if (self.format)
        data.format = self.format
      if (self.striped)
        data.striped = self.striped
      if (self.title)
        data.title = self.title
      if (self.query2)
        data.query2 = self.query2
      return data
    }

    return self
  },

  data_handler: function(query, item) {
    var body = $('#' + item.item_id + ' tbody')
//    body.empty()
//    query.data.forEach(function(series) {
//      body.append(ds.templates.models.comparison_summation_table_row({series:series, item:item}))
//    })
  },

  template: ds.templates.models.comparison_summation_table,

  interactive_properties: [
    { id: 'striped', type: 'boolean' },
    'format',
    'title',
  ].concat(ds.models.item.interactive_properties)
})
