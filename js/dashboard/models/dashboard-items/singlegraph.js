ds.register_dashboard_item('singlegraph', {

  display_name: 'Singlegraph',
  icon: 'fa fa-image',
  category: 'chart',

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .property('format', {init: ',.1s'})
                         .property('transform', {init: 'mean'})
                         .extend(ds.models.item, {item_type: 'singlegraph'})
                         .extend(ds.models.chart)
                         .build()

    if (data) {
      self.format = data.format || self.format
      self.transform = data.transform || self.transform
    }
    ds.models.chart.init(self, data)
    ds.models.item.init(self, data)
    if (!self.height) {
      self.height = 1
    }

    self.toJSON = function() {
      return ds.models.chart.json(self, ds.models.item.json(self, {
        format: self.format,
        transform: self.transform
      }))
    }
    return self
  },

  data_handler: function(query, item) {
    ds.charts.simple_area_chart($("#" + item.item_id + ' .ds-graph-holder'), item, query)
    item.options.margin = { top: 0, left: 0, bottom: 0, right: 0 }
    var label = query.data[item.index || 0].key
    var value = query.summation[item.transform]
    if (item.index) {
      value = query.data[item.index].summation[item.transform]
    }
    $('#' + item.item_id + ' span.value').text(d3.format(item.format)(value))
    $('#' + item.item_id + ' span.ds-label').text(label)
  },

  template: ds.templates.models.singlegraph,

  interactive_properties: [ 'format', 'transform' ]
                            .concat(ds.models.chart.interactive_properties,
                                    ds.models.item.interactive_properties)

})
