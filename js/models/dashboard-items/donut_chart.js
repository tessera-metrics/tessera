ds.register_dashboard_item('donut_chart', {

  display_name: 'Donut Chart',
  icon: 'fa fa-image',
  category: 'chart',

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .extend(ds.models.item, {item_type: 'donut_chart'})
                         .extend(ds.models.chart)
                         .build()
    Object.defineProperty(self, 'requires_data', {value: true})

    ds.models.chart.init(self, data)
    ds.models.item.init(self, data)

    self.toJSON = function() {
      return ds.models.chart.json(self, ds.models.item.json(self))
    }

    return self
  },

  data_handler: function(query, item) {
    ds.charts.donut_chart($("#" + item.item_id + ' .ds-graph-holder'), item, query)
  },

  template: ds.templates.models.donut_chart,

  interactive_properties: ds.models.chart.interactive_properties
                            .concat(ds.models.item.interactive_properties)

})
