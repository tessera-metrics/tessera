$(document).on('click', 'ul.ds-edit-menu li', function(event) {

  var presentation_id = $(this).parent().parent().parent().parent().parent()[0].id;
  var item = ds.manager.current.dashboard.get_item(presentation_id);

  switch (this.getAttribute('data-ds-action')) {

    case 'set-chart-type-stacked-area-chart': {
      item.set_item_type('stacked_area_chart')
      ds.manager.update_item_view(item)
      break;
    }

    case 'set-chart-type-standard-time-series': {
      item.set_item_type('standard_time_series')
      ds.manager.update_item_view(item)
      break;
    }

    case 'set-chart-type-simple-time-series': {
      item.set_item_type('simple_time_series')
      item.filled = false
      ds.manager.update_item_view(item)
      break;
    }

    case 'set-chart-type-simple-time-series-filled': {
      item.set_item_type('simple_time_series')
      item.filled = true
      ds.manager.update_item_view(item)
      break;
    }

    case 'view-definition': {
      var contents = ds.templates.edit.item_source({item:item})
      bootbox.alert(contents)
      break;
    }

  }
  /* prevents resetting scroll position */
  return false
});
