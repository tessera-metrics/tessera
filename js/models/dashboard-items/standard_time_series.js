ds.register_dashboard_item('standard_time_series', {
  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .extend(ds.models.item, {item_type: 'standard_time_series'})
                         .extend(ds.models.chart)
                         .build()

    ds.models.chart.init(self, data)
    ds.models.item.init(self, data)

    self.interactive_properties = function() {
      return ds.models.chart.interactive_properties()
               .concat(ds.models.item.interactive_properties())
    }

    self.toJSON = function() {
      return ds.models.chart.json(self, ds.models.item.json(self))
    }

    return self
  },

  data_handler: function(query, item) {
    ds.charts.standard_line_chart($('#' + item.item_id + ' .ds-graph-holder'), item, query)
  },

  template: ds.templates.models.standard_time_series

})
