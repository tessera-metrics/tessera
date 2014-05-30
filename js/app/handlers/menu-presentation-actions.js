ds.actions.register('presentation-actions', [
  ds.models.action({
    name:    'time-spans',
    display: 'View across time spans...',
    icon:    'fa fa-clock-o',
    hide: ds.app.Mode.TRANSFORM,
    handler: function(action, item) {
      ds.manager.apply_transform(ds.models.transform.TimeSpans(), item)
    }
  }),
  ds.models.action({
    name:    'time-shifts',
    display: 'Time shift...',
    icon:    'fa fa-clock-o',
    hide: ds.app.Mode.TRANSFORM,
    handler: function(action, item) {
      ds.manager.apply_transform(ds.models.transform.TimeShift(), item)
    }
  }),
  ds.models.action({
    name:    'isolate',
    display: 'Isolate...',
    icon:    'fa fa-eye',
    hide: ds.app.Mode.TRANSFORM,
    handler: function(action, item) {
      ds.manager.apply_transform(ds.models.transform.Isolate(), item)
    }
  }),
  ds.models.action({
    hide: ds.app.Mode.TRANSFORM,
    divider: true
  }),
  ds.models.action({
    name:    'open-in-graphite',
    display: 'Open in Graphite...',
    icon:    'fa fa-bar-chart-o',
    handler: function(action, item) {
      var composer_url = ds.charts.graphite.composer_url(item, { showTitle: true });
      window.open(composer_url);
    }
  }),
  ds.models.action({
    name:    'export-png',
    display: 'Export PNG...',
    icon:    'fa fa-picture-o',
    handler: function(action, item) {
      var image_url = ds.charts.graphite.chart_url(item, { showTitle: true });
      window.open(image_url);
    }
  }),
  ds.models.action({
    name:    'export-png',
    display: 'Export SVG...',
    icon:    'fa fa-code',
    handler: function(action, item) {
      var image_url = ds.charts.graphite.chart_url(item, { showTitle: true, format: 'svg' });
      window.open(image_url);
    }
  }),
  ds.models.action({
    name:    'export-csv',
    display: 'Export CSV...',
    icon:    'fa fa-table',
    handler: function(action, item) {
      var image_url = ds.charts.graphite.chart_url(item, { showTitle: true, format: 'csv' });
      window.open(image_url);
    }
  })
])

$(document).on('click', 'ul.ds-action-menu li', function(event) {

  var presentation_id = $(this).parent().parent().parent().parent().parent()[0].id;
  var item = ds.manager.current.dashboard.get_item(presentation_id);

  var action = ds.actions.get('presentation-actions', this.getAttribute('data-ds-action'))
  action.handler(action, item)

  /* prevents resetting scroll position */
  return false
});
