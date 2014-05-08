$(document).on('click', 'ul.ds-action-menu li', function(event) {

  var presentation_id = $(this).parent().parent().parent().parent().parent()[0].id;
  var item = ds.manager.current.dashboard.get_item(presentation_id);

  switch (this.getAttribute('data-ds-action')) {

    case 'open-in-graphite': {
      var composer_url = ds.charts.composer_url(item, { showTitle: true });
      window.open(composer_url);
      break;
    }

    case 'export-png': {
      var image_url = ds.charts.chart_url(item, { showTitle: true });
      window.open(image_url);
      break;
    }

    case 'export-svg': {
      var image_url = ds.charts.chart_url(item, { showTitle: true, format: 'svg' });
      window.open(image_url);
      break;
    }

  }
});
