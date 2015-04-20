/**
 * This iteration of timeshift_summation_table takes a single query
 * and applies a timeShift() value to it. Another approach is to take
 * two arbitrary queries and compare them (so it's not strictly a
 * time-based comparison).
 *
 * This version is slightly simpler to implement, because we don't
 * need to join on two asynchronously fetched queries.
 */
ds.register_dashboard_item('timeshift_summation_table', {

  display_name: 'Timeshift Summation Table',
  icon: 'fa fa-table',
  category: 'data-table',

  /**
   * Definition of the model object.
   */
  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .property('striped', {init: false})
                         .property('sortable', {init: false})
                         .property('format', {init: ',.3s'})
                         .property('title')
                         .property('shift', {init: "1d"})
                         .extend(ds.models.item, {item_type: 'timeshift_summation_table'})
                         .build()

    Object.defineProperty(self, 'requires_data', {value: true})

    function update_query() {
      if (self.query && self.query.is_query) {
        self.query_override =
          self.query.join(self.query.shift(self.shift)).set_name(self.item_id + '_shifted')
        self.query_override.render_templates(ds.context().variables)
      }
    }

    if (data) {
      self.striped = Boolean(data.striped)
      self.sortable = Boolean(data.sortable)
      self.title = data.title
      self.format = data.format || self.format
      self.shift = data.shift || self.shift
    }
    self.on('change:query', function(e) {
      update_query()
    }).on('change:dashboard', function(e) {
      update_query()
    }).on('change:shift', function(e) {
      update_query()
    })
    ds.models.item.init(self, data)

    self.toJSON = function() {
      var data = ds.models.item.json(self)
      data.format = self.format
      data.striped = self.striped
      data.sortable = self.sortable
      data.title = self.title
      data.shift = self.shift
      return data
    }

    return self
  },

  /**
   * Handler to update the rendered DOM once the data query has been
   * evaluated.
   */
  data_handler: function(query, item) {
    var body = $('#' + item.item_id + ' tbody')
    var now  = query.data[0].summation
    var then = query.data[1].summation
    var diff = ds.models.data.Summation(now).subtract(then);
    var properties = ['mean', 'median', 'min', 'max', 'sum']
    var float_margin = 0.000001
    properties.forEach(function(prop) {
      var value = diff[prop]

      if (value > float_margin)
        diff[prop + '_class'] = 'ds-diff-plus'
      else if (value < -float_margin)
        diff[prop + '_class'] = 'ds-diff-minus'

      if ((float_margin > value) && (value > -float_margin))
        value = 0.0

      var pct = (now[prop] / then[prop]) - 1
      pct = isNaN(pct) ? 0.0 : pct
      diff[prop + '_pct'] = d3.format(',.2%')(Math.abs(pct))
      diff[prop] = Math.abs(value)
    })
    body.empty()
    body.append(ds.templates.models.timeshift_summation_table_body({
      now:  now,
      then: then,
      diff: diff,
      item: item
    }))
    if (item.sortable) {
      body.parent().DataTable({
        autoWidth: false,
        paging: false,
        searching: false,
        info: false
      })
    }
  },

  template: ds.templates.models.timeshift_summation_table,

  interactive_properties: [
    { id: 'striped', type: 'boolean' },
    { id: 'sortable', type: 'boolean' },
    'format',
    'title',
    'query',
    'shift',
    { id: 'css_class', category: 'base' }
  ],

  /**
   * Additional actions specific to this presentation type to be added
   * to the presentation actions menu.
   */
  actions: [
    ds.action({
      name:    'timeshift_1h',
      display: '1 Hour Ago',
      icon:    'fa fa-clock-o',
      handler: function(action, item) {
        item.shift = '1h'
        ds.manager.update_item_view(item)
      }
    }),
    ds.action({
      name:    'timeshift_1d',
      display: '1 Day Ago',
      icon:    'fa fa-clock-o',
      handler: function(action, item) {
        item.shift = '1d'
        ds.manager.update_item_view(item)
      }
    }),
    ds.action({
      name:    'timeshift_1w',
      display: '1 Week Ago',
      icon:    'fa fa-clock-o',
      handler: function(action, item) {
        item.shift = '1w'
        ds.manager.update_item_view(item)
      }
    }),
    ds.action({
      name:    'timeshift_user_input',
      display: 'Pick interval...',
      icon:    'fa fa-clock-o',
      handler: function(action, item) {
        bootbox.prompt({
          backdrop: false,
          title: "Enter a time shift interval",
          callback: function(result) {
            if (result) {
              item.shift = result
              ds.manager.update_item_view(item)
            }
          }
        })
      }
    })
  ]
})
