ds.actions.register('presentation-actions', [
  // TODO: generate these from the registered transforms
  ds.action({
    name:    'time-spans',
    display: 'View across time spans...',
    icon:    'fa fa-clock-o',
    hide: ds.app.Mode.TRANSFORM,
    handler: function(action, item) {
      ds.manager.apply_transform('TimeSpans', item)
    }
  }),
  ds.action({
    name:    'time-shifts',
    display: 'Time shift...',
    icon:    'fa fa-clock-o',
    hide: ds.app.Mode.TRANSFORM,
    handler: function(action, item) {
      ds.manager.apply_transform('TimeShift', item)
    }
  }),
  ds.action({
    name:    'isolate',
    display: 'Isolate...',
    icon:    'fa fa-eye',
    hide: ds.app.Mode.TRANSFORM,
    handler: function(action, item) {
      ds.manager.apply_transform('Isolate', item)
    }
  }),
  ds.action({
    name:    'highlight_averages',
    display: 'Highlight Averages...',
    icon:    'fa fa-eye',
    hide: ds.app.Mode.TRANSFORM,
    handler: function(action, item) {
      ds.manager.apply_transform('HighlightAverages', item)
    }
  }),
  ds.action({
    name:    'expand_latency',
    display: 'Expand Latencies...',
    icon:    'fa fa-eye',
    hide: ds.app.Mode.TRANSFORM,
    handler: function(action, item) {
      ds.manager.apply_transform('ExpandLatency', item)
    }
  }),
  ds.action({
    hide: ds.app.Mode.TRANSFORM,
    divider: true
  }),
  ds.action({
    name:    'open-in-graphite',
    display: 'Open in Graphite...',
    icon:    'fa fa-bar-chart-o',
    handler: function(action, item) {
      var composer_url = ds.charts.graphite.composer_url(item, { showTitle: true })
      window.open(composer_url)
    }
  }),
  ds.action({
    name:    'export-png',
    display: 'Export PNG...',
    icon:    'fa fa-file-image-o',
    handler: function(action, item) {
      var image_url = ds.charts.graphite.chart_url(item, { showTitle: true })
      window.open(image_url)
    }
  }),
  ds.action({
    name:    'export-svg',
    display: 'Export SVG...',
    icon:    'fa fa-file-code-o',
    handler: function(action, item) {
      var image_url = ds.charts.graphite.chart_url(item, { showTitle: true, format: 'svg' })
      window.open(image_url)
    }
  }),
  ds.action({
    name:    'export-csv',
    display: 'Export CSV...',
    icon:    'fa fa-file-excel-o',
    handler: function(action, item) {
      var image_url = ds.charts.graphite.chart_url(item, { showTitle: true, format: 'csv' })
      window.open(image_url)
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
