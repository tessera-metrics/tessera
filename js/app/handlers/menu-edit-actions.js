ds.actions.register('presentation-edit', [
  ds.models.action({
    name:    'view-definition',
    display: 'View definition...',
    icon:    'fa fa-code',
    handler: function(action, item) {
      var contents = ds.templates.edit.item_source({item:item})
      bootbox.alert(contents)
    }
  }),
  ds.models.action({
    divider: true
  }),
  ds.models.action({
    name:    'set-chart-type-simple-time-series',
    display: 'Simple Time Series',
    icon:    'fa fa-picture-o',
    handler: function(action, item) {
      item.set_item_type('simple_time_series')
      item.filled = false
      ds.manager.update_item_view(item)
    }
  }),
  ds.models.action({
    name:    'set-chart-type-simple-time-series-filled',
    display: 'Simple Time Series (Filled)',
    icon:    'fa fa-picture-o',
    handler: function(action, item) {
      item.set_item_type('simple_time_series')
      item.filled = true
      ds.manager.update_item_view(item)
    }
  }),
  ds.models.action({
    name:    'set-chart-type-standard-time-series',
    display: 'Standard Time Series',
    icon:    'fa fa-picture-o',
    handler: function(action, item) {
      item.set_item_type('standard_time_series')
      ds.manager.update_item_view(item)
    }
  }),
  ds.models.action({
    name:    'set-chart-type-stacked-area-chart',
    display: 'Stacked Area Chart',
    icon:    'fa fa-bar-chart-o',
    handler: function(action, item) {
      item.set_item_type('stacked_area_chart')
      ds.manager.update_item_view(item)
    }
  })
])

$(document).on('click', 'ul.ds-edit-menu li', function(event) {

  var presentation_id = $(this).parent().parent().parent().parent().parent()[0].id
  var item = ds.manager.current.dashboard.get_item(presentation_id)

  var action = ds.actions.get('presentation-edit', this.getAttribute('data-ds-action'))
  action.handler(action, item)

  /* prevents resetting scroll position */
  return false
})
