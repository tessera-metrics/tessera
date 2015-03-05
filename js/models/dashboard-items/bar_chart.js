ds.register_dashboard_item('bar_chart', {

  display_name: 'Bar Chart',
  icon: 'fa fa-image',
  category: 'chart',

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .extend(ds.models.item, {item_type: 'bar_chart'})
                         .extend(ds.models.chart)
                         .build()

    // Properties to add:
    //  stack_mode (none, stack, percent)

    if (data) {
      // TODO
    }

    ds.models.chart.init(self, data)
    ds.models.item.init(self, data)

    self.toJSON = function() {
      return ds.models.chart.json(self, ds.models.item.json(self, {
        // TODO
      }))
    }

    return self
  },

  data_handler: function(query, item) {
    ds.charts.bar_chart($('#' + item.item_id + ' .ds-graph-holder'), item, query)
  },

  template: ds.templates.models.bar_chart,

  interactive_properties: [
    // TODO
  ].concat(ds.models.chart.interactive_properties,
           ds.models.item.interactive_properties)

})
