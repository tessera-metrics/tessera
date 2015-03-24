ds.register_dashboard_item('discrete_bar_chart', {

  display_name: 'Bar Chart (Discrete)',
  icon: 'fa fa-bar-chart',
  category: 'chart',

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .extend(ds.models.item, {item_type: 'discrete_bar_chart'})
                         .extend(ds.models.chart)
                         .property('transform', {init: 'sum'})
                         .property('orientation', {init: 'vertical'})
                         .property('format', {init: ',.3s'})
                         .property('show_grid', {init: true})
                         .property('show_numbers', {init: true})
                         .property('hide_zero_series', {init: false})
                         .build()

    if (data) {
      self.legend = undefined
      self.transform = data.transform || self.transform
      self.orientation = data.orientation || self.orientation
      self.format = data.format || self.format
      if (typeof(data.show_grid) !== 'undefined') {
        self.show_grid = Boolean(data.show_grid)
      }
      if (typeof(data.show_numbers) !== 'undefined') {
        self.show_numbers = Boolean(data.show_numbers)
      }
      if (typeof(data.hide_zero_series !== 'undefined')) {
        self.hide_zero_series = Boolean(data.hide_zero_series)
      }
    }

    ds.models.chart.init(self, data)
    ds.models.item.init(self, data)

    self.toJSON = function() {
      return ds.models.chart.json(self, ds.models.item.json(self, {
        orientation: self.orientation,
        transform: self.transform,
        format: self.format,
        show_grid: self.show_grid,
        show_numbers: self.show_numbers,
        hide_zero_series: self.hide_zero_series
      }))
    }

    return self
  },

  data_handler: function(query, item) {
    ds.charts.discrete_bar_chart($('#' + item.item_id + ' .ds-graph-holder'), item, query)
  },

  template: ds.templates.models.discrete_bar_chart,

  interactive_properties: [
    'transform',
    'format',
    { id: 'show_grid', type: 'boolean' },
    { id: 'show_numbers', type: 'boolean' },
    { id: 'hide_zero_series', type: 'boolean' },
    {
      id: 'orientation',
      type: 'select',
      edit_options: {
        source: [
          'horizontal',
          'vertical'
        ]
      }
    }
  ].concat(ds.models.chart.interactive_properties,
           ds.models.item.interactive_properties)

})
