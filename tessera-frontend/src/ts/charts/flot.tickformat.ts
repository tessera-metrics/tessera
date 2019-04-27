import * as app from '../app/app'

declare var $, moment

function tick_formatter(value, axis) {
  // Take care of time series axis
  if (axis.tickSize && axis.tickSize.length === 2) {
    if (axis.tickSize[1] === 'year' && axis.tickSize[0] >= 1)
      return moment(value).tz(app.config.DISPLAY_TIMEZONE).format('YYYY')
    if (axis.tickSize[1] === 'month' && axis.tickSize[0] >= 1 || axis.tickSize[1] === 'year')
      return moment(value).tz(app.config.DISPLAY_TIMEZONE).format('MM-\'YY')
    if (axis.tickSize[1] === 'day' && axis.tickSize[0] >= 1 || axis.tickSize[1] === 'month')
      return moment(value).tz(app.config.DISPLAY_TIMEZONE).format('MM/DD')
    if (axis.tickSize[1] === 'hour' && axis.tickSize[0] >= 12)
      return moment(value).tz(app.config.DISPLAY_TIMEZONE).format('MM/DD hA')
  }
  return moment(value).tz(app.config.DISPLAY_TIMEZONE).format('h:mm A')
}

function time_format_init(plot) {
  plot.hooks.processOptions.push(function(plot, options) {
    $.each(plot.getAxes(), function(axisName, axis) {
      let opts = axis.options
      if (opts.mode == "time") {
        axis.tickFormatter = tick_formatter
      }
    })
  })
}

$.plot.plugins.push({
  init: time_format_init,
  options: {},
  name: 'tessera-time-format',
  version: '1.0',
})
