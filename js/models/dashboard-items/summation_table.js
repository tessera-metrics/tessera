ds.register_dashboard_item('summation_table', {

  display_name: 'Summation Table',
  icon: 'fa fa-table',
  category: 'data-table',

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .property('striped', {init: false})
                         .property('show_color', {init: false})
                         .property('format', {init: ',.3s'})
                         .property('title')
                         .property('options')
                         .extend(ds.models.item, {item_type: 'summation_table'})
                         .build()
    Object.defineProperty(self, 'requires_data', {value: true})

    if (data) {
      self.striped = Boolean(data.striped)
      self.show_color = Boolean(data.show_color)
      self.title = data.title
      self.format = data.format || self.format
      self.options = data.options
    }
    ds.models.item.init(self, data)

    self.toJSON = function() {
      var data = ds.models.item.json(self)
      if (self.format)
        data.format = self.format
      if (self.striped)
        data.striped = self.striped
      if (self.show_color)
        data.show_color = self.show_color
      if (self.title)
        data.title = self.title
      if (self.options)
        data.options = self.options
      return data
    }

    return self
  },

  data_handler: function(query, item) {
    var options = item.options || {}
    var palette = ds.charts.util.get_palette(options.palette)
    var body = $('#' + item.item_id + ' tbody')
    body.empty()
    query.data.forEach(function(series, i) {
      var color = palette[i % palette.length]
      body.append(ds.templates.models.summation_table_row({series:series, item:item, color: color}))
    })
  },

  template: ds.templates.models.summation_table,

  interactive_properties: [
    { id: 'striped', type: 'boolean' },
    { id: 'show_color', type: 'boolean' },
    'format',
    'title',
    'chart.palette',
  ].concat(ds.models.item.interactive_properties)
})
