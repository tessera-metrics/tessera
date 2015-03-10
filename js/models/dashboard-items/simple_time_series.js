ds.register_dashboard_item('simple_time_series', {

  display_name: 'Simple Time Series',
  icon: 'fa fa-line-chart',
  category: 'chart',

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .extend(ds.models.item, {item_type: 'simple_time_series'})
                         .extend(ds.models.chart)
                         .property('filled', {init: false})
                         .property('show_max_value', {init: false})
                         .property('show_min_value', {init: false})
                         .property('show_last_value', {init: false})
                         .build()

    if (data) {
      self.legend = data.legend
      self.filled = Boolean(data.filled)
      self.show_max_value = Boolean(data.show_max_value)
      self.show_min_value = Boolean(data.show_min_value)
      self.show_last_value = Boolean(data.show_last_value)
    }
    ds.models.chart.init(self, data)
    ds.models.item.init(self, ds.extend({ height: 1 }, data))

    self.toJSON = function() {
      return ds.models.chart.json(self, ds.models.item.json(self, {
        filled: self.filled,
        show_max_value: self.show_max_value,
        show_min_value: self.show_min_value,
        show_last_value: self.show_last_value
      }))
    }

    return self
  },

  data_handler: function(query, item) {
    if (item.filled) {
      ds.charts.simple_area_chart($('#' + item.item_id + ' .ds-graph-holder'), item, query)
    } else {
      ds.charts.simple_line_chart($('#' + item.item_id + ' .ds-graph-holder'), item, query)
    }
  },

  template: ds.templates.models.simple_time_series,

  interactive_properties: [
    { id: 'filled', type: 'boolean' },
    { id: 'show_max_value', type: 'boolean' },
    { id: 'show_min_value', type: 'boolean' },
    { id: 'show_last_value', type: 'boolean' }
  ].concat(ds.models.chart.interactive_properties,
           ds.models.item.interactive_properties)
})
