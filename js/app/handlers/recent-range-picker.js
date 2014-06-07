$(document).on('click', '.ds-recent-range-picker', function(e) {
  ds.manager.set_time_range($(e.target).attr('data-ds-range'), null)
})
