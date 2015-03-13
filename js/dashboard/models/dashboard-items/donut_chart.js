ds.register_dashboard_item('donut_chart', {

  display_name: 'Donut Chart',
  icon: 'fa fa-pie-chart',
  category: 'chart',

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .extend(ds.models.item, {item_type: 'donut_chart'})
                         .extend(ds.models.chart)
                         .property('labels', {init: false})
                         .property('is_pie', {init: false})
                         .property('hide_zero_series', {init: false})
                         .build()
    Object.defineProperty(self, 'requires_data', {value: true})

    if (data) {
      if (typeof(data.labels) !== 'undefined') {
        self.labels = Boolean(data.labels)
      }
      if (typeof(data.is_pie) !== 'undefined') {
        self.is_pie = Boolean(data.is_pie)
      }
      if (typeof(data.hide_zero_series !== 'undefined')) {
        self.hide_zero_series = Boolean(data.hide_zero_series)
      }
    }

    ds.models.chart.init(self, data)
    ds.models.item.init(self, data)

    self.toJSON = function() {
      return ds.models.chart.json(self, ds.models.item.json(self, {
        labels: self.labels,
        is_pie: self.is_pie,
        hide_zero_series: self.hide_zero_series
      }))
    }

    return self
  },

  data_handler: function(query, item) {
    ds.charts.donut_chart($("#" + item.item_id + ' .ds-graph-holder'), item, query)
  },

  template: ds.templates.models.donut_chart,

  interactive_properties: [
    { id: 'labels', type: 'boolean' },
    { id: 'is_pie', type: 'boolean' },
    { id: 'hide_zero_series', type: 'boolean' },
  ].concat(ds.models.chart.interactive_properties,
           ds.models.item.interactive_properties)

})
