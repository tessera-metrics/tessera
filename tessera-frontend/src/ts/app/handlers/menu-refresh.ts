import manager from '../manager'

$(document).on('click', 'button.ds-refresh-button', function(e) {
  manager.refresh()
})

$(document).on('click', 'ul.ds-refresh-menu li', function(e) {
  let target = $(e.target).parent()
  if (target.attr('data-ds-range')) {
    let range = target.attr('data-ds-range')
    manager.set_time_range(range, null)
    $("ul.ds-refresh-menu li[data-ds-range]").removeClass('active')
    $("ul.ds-refresh-menu li[data-ds-range=" + range + "]").addClass('active')
  } else if (target.attr('data-ds-interval')) {
    let interval = target.attr('data-ds-interval')
    manager.set_refresh_interval(interval)
    $("ul.ds-refresh-menu li[data-ds-interval]").removeClass('active')
    $("ul.ds-refresh-menu li[data-ds-interval=" + interval + "]").addClass('active')
  }
  return false
})
