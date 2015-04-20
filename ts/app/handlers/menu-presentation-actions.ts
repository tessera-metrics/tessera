ds.actions.register('presentation-actions', [
  ds.action({
    name:    'open-in-graphite',
    display: 'Open in Graphite...',
    icon:    'fa fa-bar-chart-o',
    handler: function(action, item) {
      var composer_url = ds.charts.graphite.composer_url(item, { showTitle: true })
      window.open(composer_url.href())
    }
  }),
  ds.action({
    name:    'export-png',
    display: 'Export PNG...',
    icon:    'fa fa-file-image-o',
    handler: function(action, item) {
      var image_url = ds.charts.graphite.chart_url(item, { showTitle: true })
      window.open(image_url.href())
    }
  }),
  ds.action({
    name:    'export-svg',
    display: 'Export SVG...',
    icon:    'fa fa-file-code-o',
    handler: function(action, item) {
      var image_url = ds.charts.graphite.chart_url(item, { showTitle: true, format: 'svg' })
      window.open(image_url.href())
    }
  }),
  ds.action({
    name:    'export-csv',
    display: 'Export CSV...',
    icon:    'fa fa-file-excel-o',
    handler: function(action, item) {
      var image_url = ds.charts.graphite.chart_url(item, { showTitle: true, format: 'csv' })
      window.open(image_url.href())
    }
  })
])

$(document).on('click', 'ul.ds-action-menu li', function(event) {

  var presentation_id = $(this).parent().parent().parent().parent().parent()[0].id
  var item = ds.manager.current.dashboard.get_item(presentation_id)

  var action = ds.actions.get(this.getAttribute('data-ds-category'), this.getAttribute('data-ds-action'))
  action.handler(action, item)

  /* prevents resetting scroll position */
  return false
})
