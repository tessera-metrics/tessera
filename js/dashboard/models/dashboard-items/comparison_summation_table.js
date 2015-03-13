/**
 * A summation table that compares two arbitrary queries.
 */
ds.register_dashboard_item('comparison_summation_table', {

  display_name: 'Comparison Summation Table',
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
                         .property('query_other', {
                           get: function(context) {
                             if (typeof(context.query_other) === 'string' && context.dashboard) {
                               return context.dashboard.definition.queries[context.query_other]
                             } else {
                               return context.query_other
                             }
                           }
                         })
                         .extend(ds.models.item, {item_type: 'comparison_summation_table'})
                         .build()

    Object.defineProperty(self, 'requires_data', {value: true})

    function update_query() {
      if ((self.query && self.query.is_query) && (self.query_other && self.query_other.is_query)) {
        self.query_override =
          self.query.join(self.query_other).set_name(self.item_id + '_joined')
        self.query_override.render_templates(ds.context().variables)
      }
    }

    if (data) {
      self.striped = Boolean(data.striped)
      self.sortable = Boolean(data.sortable)
      self.title = data.title
      self.format = data.format || self.format
      self.query_other = data.query_other
    }
    self.on('change:query', function(e) {
      update_query()
    }).on('change:query_other', function(e) {
      update_query()
    }).on('change:dashboard', function(e) {
      update_query()
    })
    ds.models.item.init(self, data)
    update_query()

    self.toJSON = function() {
      var data = ds.models.item.json(self)
      data.format = self.format
      data.striped = self.striped
      data.sortable = self.sortable
      data.title = self.title
      if (self.query_other) {
        data.query_other = self.query_other.name
      }
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
    var properties = ['mean', 'min', 'max', 'sum']
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
    body.append(ds.templates.models.comparison_summation_table_body({
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

  template: ds.templates.models.comparison_summation_table,

  interactive_properties: [
    { id: 'striped', type: 'boolean' },
    { id: 'sortable', type: 'boolean' },
    'format',
    'title',
    'query',
    {
      id: 'query_other',
      category: 'base',
      template: '{{item.query_other.name}}',
      edit_options: {
        type: 'select',
        source: function() {
          var queries = ds.manager.current.dashboard.definition.queries
          return Object.keys(queries).map(function(k) {
                   return { value: k, text: k }
                 })
        },
        value: function(item) {
          return item.query_other ? item.query_other.name : undefined
        }
      }
    },
    {
      id: 'css_class', category: 'base'
    }
  ]
})
