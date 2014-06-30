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

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .property('striped', {init: false})
                         .property('format', {init: ',.3s'})
                         .property('title')
                         .property('shift', {init: "1d"})
                         .extend(ds.models.item, {item_type: 'timeshift_summation_table'})
                         .build()

    Object.defineProperty(self, 'requires_data', {value: true})

    function update_query() {
      self.query_override = shift_query(self.query, self)
    }

    if (data) {
      if (typeof(data.striped) !== 'undefined')
        self.striped = data.striped
      self.title = data.title
      self.format = data.format || self.format
      self.shift = data.shift || self.shift
    }
    self.on('change:query', function(e) {
      update_query()
    }).on('change:dashboard', function(e) {
      update_query()
    }).on('change:query_override', function(e) {
      //ds.manager.update_item_view(self)
    })
    ds.models.item.init(self, data)

    function shift_query(input, item) {
      if (input && input.is_query) {
        var targets = input.targets
        if (!targets)
          return undefined
        var group = 'group(' + input.targets.join(',') + ')'
        return ds.models.data.Query()
               .set_name(item.item_id + '_shift_' + input.name)
               .set_targets([
                 group,
                 'timeShift(' + group + ', \"' + item.shift + '\")'
               ])
      } else {
        return undefined
      }
    }

    self.toJSON = function() {
      var data = ds.models.item.json(self)
      data.format = self.format
      data.striped = self.striped
      data.title = self.title
      data.shift = self.shift
      return data
    }

    return self
  },

  data_handler: function(query, item) {
    var body = $('#' + item.item_id + ' tbody')
    var now  = query.data[0].summation
    var then = query.data[1].summation
    var diff = ds.models.data.Summation(now).subtract(then);
    var properties = ['mean', 'min', 'max', 'sum']
    var float_margin = 0.000001
    properties.forEach(function(prop) {
      if (diff[prop] > float_margin)
        diff[prop + '_class'] = 'ds-diff-plus'
      else if (diff[prop] < -float_margin)
        diff[prop + '_class'] = 'ds-diff-minus'

      var pct = (now[prop] / then[prop]) - 1
      pct = isNaN(pct) ? 0.0 : pct
      diff[prop + '_pct'] = d3.format(',.2%')(Math.abs(pct))
      diff[prop] = Math.abs(diff[prop])
    })
    body.empty()
    body.append(ds.templates.models.timeshift_summation_table_body({
      now:  now,
      then: then,
      diff: diff,
      item: item
    }))
  },

  template: ds.templates.models.timeshift_summation_table,

  interactive_properties: [
    { id: 'striped', type: 'boolean' },
    'format',
    'title',
    'query',
    'shift',
    { id: 'css_class', category: 'base' }
  ]
})
