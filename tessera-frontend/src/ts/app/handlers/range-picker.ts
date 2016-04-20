import manager from '../manager'
import * as app from '../app'

declare var moment

var GRAPHITE_FORMAT = 'HH:mm_YYYYMMDD'
var self : any = {}

self.null_handler = function() {
}

self.update_handler = function() {
  let from  = $('#ds-range-picker-from').data("DateTimePicker").date()
  let until = $('#ds-range-picker-until').data("DateTimePicker").date()
  if (from && until) {
    /**
     * Disable the handler, because the picker will re-raise events
     * when being set programmatically after the dashboard loads,
     * leading to looping.
     */
    self.disable_handler()
    manager.set_time_range(from.utc().format(GRAPHITE_FORMAT), until.utc().format(GRAPHITE_FORMAT))
  }
}

self.handler = self.null_handler

self.enable_handler = function() {
  self.handler = self.update_handler
}

self.disable_handler = function() {
  self.handler = self.null_handler
}

/**
 * Ensure that we can't end up with inverted time ranges (i.e. with
 * the 'from' time later than the 'until' time).
 */
$(document).on('dp.change', '#ds-range-picker-from', function(e) {
  let picker = $('#ds-range-picker-to').data('DateTimePicker')
  if (picker) {
    picker.minDate(e.date)
  }
})

$(document).on('dp.change', '#ds-range-picker-to', function(e) {
  let picker = $('#ds-range-picker-from').data('DateTimePicker')
  if (picker) {
    picker.maxDate(e.date)
  }
})

/**
 * Main event handler for responding to changes in the picker.
 */
$(document).on('dp.change', '#ds-range-picker-from, #ds-range-picker-until', function(e) {
  self.handler(e)
})


$(document).on('click', '.ds-recent-range-picker li, .ds-recent-range-picker a, .ds-custom-range-picker ul li, .ds-custom-range-picker ul li a', function(e) {
  let range = $(e.target).attr('data-ds-range')

  if (range === 'custom') {
    $('.ds-recent-range-picker').hide()
    $('.ds-custom-range-picker').show()

    let now = moment.utc().startOf('minute').tz(app.config.DISPLAY_TIMEZONE)
    now.minute( Math.round(now.minute() / 15) * 15) // quantize to 15-min interval

    let from_picker = $('#ds-range-picker-from').data("DateTimePicker")
    from_picker.date(now.clone().subtract(3, 'hours').tz(app.config.DISPLAY_TIMEZONE))

    let until_picker = $('#ds-range-picker-until').data("DateTimePicker")
    until_picker.date(now)
    until_picker.maxDate(now)
    from_picker.maxDate(now)

    self.enable_handler()

  } else if (range === 'recent') {
    self.disable_handler()

    $('.ds-custom-range-picker').hide()
    $('.ds-recent-range-picker').show()

  } else {
    self.disable_handler()
    manager.set_time_range(range, null)
  }
  return false
})

$(document).ready(function() {
  let picker = $('.ds-custom-range-entry')
  if (picker.length) {
    $('.ds-custom-range-entry').datetimepicker({
      showTodayButton: true,
      widgetPositioning: {
        vertical: 'bottom',
        horizontal: 'right'
      },
      sideBySide: true,
      stepping: 15,
      icons: {
        time: 'fa fa-clock-o',
        date: 'fa fa-calendar-o',
        up:   'fa fa-chevron-up',
        down: 'fa fa-chevron-down'
      }
    })
  }

  manager.onDashboardLoaded(function() {
    let params = new URI(window.location).search(true)
    if (params.from && params.until) {
      // Initialise the range date pickers with the values from the URL query parameters
      // TODO - don't do this for relative specifiers
      $('#ds-range-picker-from').data("DateTimePicker").date(moment.utc(params.from, GRAPHITE_FORMAT));
      $('#ds-range-picker-until').data("DateTimePicker").date(moment.utc(params.until, GRAPHITE_FORMAT));
      $('.ds-recent-range-picker').hide()
      $('.ds-custom-range-picker').show()
      self.enable_handler()
    }
  })
})
