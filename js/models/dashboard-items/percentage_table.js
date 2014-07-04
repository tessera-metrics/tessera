ds.register_dashboard_item('percentage_table', {

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .property('format', {init: ',.3s'})
                         .property('title')
                         .property('include_sums', {init: false})
                         .extend(ds.models.item, {item_type: 'percentage_table'})
                         .build()
    Object.defineProperty(self, 'requires_data', {value: true})

    if (data) {
      self.include_sums = data.include_sums
      self.title = data.title
      self.format = data.format || self.format
    }
    ds.models.item.init(self, data)

    self.toJSON = function() {
      var data = ds.models.item.json(self)
      if (self.format)
        data.format = self.format
      if (self.title)
        data.title = self.title
      data.include_sums = self.include_sums
      return data
    }

    return self
  },

  data_handler: function(query, item) {

    query.data.forEach(function(series) {
      series.summation.percent = 1 / (query.summation.sum / series.summation.sum)
    })

    var holder = $('#' + item.item_id + ' .ds-percentage-table-holder')
    holder.empty()
    holder.append(ds.templates.models.percentage_table_data({item:item, query:query}))
  },

  template: ds.templates.models.percentage_table,

  interactive_properties: [
    'format',
    'title',
    {
      id: 'include_sums',
      type: 'boolean'
    }
  ].concat(ds.models.item.interactive_properties)
})
