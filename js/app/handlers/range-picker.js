$(document).on('click', '.ds-recent-range-picker li, .ds-recent-range-picker a, .ds-custom-range-picker ul li, .ds-custom-range-picker ul li a', function(e) {
  var range = $(e.target).attr('data-ds-range')
  console.log(range)
  if (range === 'custom') {
    $('.ds-recent-range-picker').hide()
    $('.ds-custom-range-picker').show()
  } else if (range === 'recent') {
    $('.ds-custom-range-picker').hide()
    $('.ds-recent-range-picker').show()
  } else {
    ds.manager.set_time_range(range, null)
  }
    return false
})
