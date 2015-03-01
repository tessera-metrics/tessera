ds.register_dashboard_item('percentage_table', {

  display_name: 'Percentage Table',
  icon: 'fa fa-table',
  category: 'data-table',

  constructor: function(data) {
    'use strict'

    var self = limivorous.observable()
                         .property('format', {init: ',.3s'})
                         .property('title')
                         .property('striped', {init: true})
                         .property('sortable', {init: true})
                         .property('include_sums', {init: false})
                         .property('groups_as_rows', {init: false})
                         .property('transform', {init: 'sum'})
                         .extend(ds.models.item, {item_type: 'percentage_table'})
                         .build()
    Object.defineProperty(self, 'requires_data', {value: true})

    if (data) {
      self.include_sums = data.include_sums
      self.groups_as_rows = data.groups_as_rows
      self.striped = Boolean(data.striped)
      self.sortable = Boolean(data.sortable)
      self.title = data.title
      self.format = data.format || self.format
      self.transform = data.transform || self.transform
    }
    ds.models.item.init(self, data)

    self.toJSON = function() {
      var data = ds.models.item.json(self)
      if (self.format)
        data.format = self.format
      if (self.groups_as_rows)
        data.groups_as_rows = self.groups_as_rows
      if (self.striped)
        data.striped = self.striped
      if (self.sortable)
        data.sortable = self.sortable
      if (self.title)
        data.title = self.title
      if (self.transform)
        data.transform = self.transform
        data.include_sums = self.include_sums
      return data
    }

    return self
  },

  data_handler: function(query, item) {

    query.summation.percent_value = query.summation[item.transform]

    query.data.forEach(function(series) {
      series.summation.percent = 1 / (query.summation[item.transform] / series.summation[item.transform])
      series.summation.percent_value = series.summation[item.transform]
    })

    var holder = $('#' + item.item_id + ' .ds-percentage-table-holder')
    holder.empty()
    holder.append(ds.templates.models.percentage_table_data({item:item, query:query}))
    var table = $('#' + item.item_id + ' .ds-percentage-table-holder table')
    if (item.sortable) {
      table.DataTable({
        order: [[ 2, "desc" ]],
        paging: false,
        searching: true,
        oLanguage: { sSearch: "" },
        info: true
      })
    }
  },

  template: ds.templates.models.percentage_table,

  interactive_properties: [
    { id: 'striped', type: 'boolean' },
    { id: 'sortable', type: 'boolean' },
    { id: 'include_sums', type: 'boolean' },
    { id: 'groups_as_rows', type: 'boolean' },
    'format',
    'title',
    'transform'
  ].concat(ds.models.item.interactive_properties)
})
