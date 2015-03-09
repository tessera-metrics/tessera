ds.register_dashboard_item('bar_chart', {

  display_name: 'Bar Chart',
  icon: 'fa fa-bar-chart',
  category: 'chart',

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .extend(ds.models.item, {item_type: 'bar_chart'})
                         .extend(ds.models.chart)
                         .property('stack_mode', {init: ds.charts.StackMode.NORMAL})
                         .build()

    if (data) {
      if (data.stack_mode) {
        self.stack_mode = data.stack_mode
      }
    }

    ds.models.chart.init(self, data)
    ds.models.item.init(self, data)

    self.toJSON = function() {
      return ds.models.chart.json(self, ds.models.item.json(self, {
        stack_mode: self.stack_mode
      }))
    }

    return self
  },

  data_handler: function(query, item) {
    ds.charts.bar_chart($('#' + item.item_id + ' .ds-graph-holder'), item, query)
  },

  template: ds.templates.models.bar_chart,

  interactive_properties: [
    {
      id: 'stack_mode',
      type: 'select',
      edit_options: {
        source: [
          ds.charts.StackMode.NONE,
          ds.charts.StackMode.NORMAL,
          ds.charts.StackMode.PERCENT
        ]
      }
    }
  ].concat(ds.models.chart.interactive_properties,
           ds.models.item.interactive_properties)

})
