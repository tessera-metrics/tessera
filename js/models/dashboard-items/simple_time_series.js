ds.register_dashboard_item('simple_time_series', {

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .extend(ds.models.item, {item_type: 'simple_time_series'})
                         .extend(ds.models.chart)
                         .property('filled', {init: false})
                         .build()

    if (data) {
      self.filled = data.filled !== false
    }
    ds.models.chart.init(self, data)
    ds.models.item.init(self, data)

    self.toJSON = function() {
      return ds.models.chart.json(self, ds.models.item.json(self, {
        filled: self.filled
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

  interactive_properties: [ { id: 'filled', type: 'boolean' } ]
                            .concat(ds.models.chart.interactive_properties,
                                    ds.models.item.interactive_properties)
})
