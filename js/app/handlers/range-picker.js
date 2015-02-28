$(document).on('dp.change', '#ds-range-picker-from, #ds-range-picker-until', function(e) {
  var from = $('#ds-range-picker-from').data("DateTimePicker").date()
  var until = $('#ds-range-picker-until').data("DateTimePicker").date()
  if (from && until) {
    var GRAPHITE_FORMAT = 'HH:mm_YYYYMMDD'
    // console.log('setting range to ' + from.calendar() + ' until ' + until.calendar())
    ds.manager.set_time_range(from.format(GRAPHITE_FORMAT), until.format(GRAPHITE_FORMAT))
  }
})

$(document).on('click', '.ds-recent-range-picker li, .ds-recent-range-picker a, .ds-custom-range-picker ul li, .ds-custom-range-picker ul li a', function(e) {
  var range = $(e.target).attr('data-ds-range')

  if (range === 'custom') {
    $('.ds-recent-range-picker').hide()
    $('.ds-custom-range-picker').show()

    var now = moment().utc().startOf('minute')
    now.minute( Math.round(now.minute() / 15) * 15) // quantize to 15-min interval

    var from_picker = $('#ds-range-picker-from').data("DateTimePicker")
    from_picker.date(now.clone().subtract(3, 'hours'))

    var until_picker = $('#ds-range-picker-until').data("DateTimePicker")
    until_picker.date(now)
    until_picker.maxDate(now.clone().endOf('day'))

  } else if (range === 'recent') {
    $('.ds-custom-range-picker').hide()
    $('.ds-recent-range-picker').show()

  } else {
    ds.manager.set_time_range(range, null)
  }
    return false
})

$(document).ready(function() {
  ds.manager.onDashboardLoaded(function() {
    var params = URI(window.location).search(true)
    if (params.from && params.until) {
      // Initialise the range date pickers with the values from the URL query parameters
      var GRAPHITE_FORMAT = 'HH:mm_YYYYMMDD' // XXX This should a a scoped global in the ds object
      $('#ds-range-picker-from').data("DateTimePicker").date(moment(params.from, GRAPHITE_FORMAT));
      $('#ds-range-picker-until').data("DateTimePicker").date(moment(params.until, GRAPHITE_FORMAT));
      $('.ds-recent-range-picker').hide()
      $('.ds-custom-range-picker').show()
    }
  });
});
