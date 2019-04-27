declare var URI, window

import manager from '../manager'
import * as app from '../app'
import SimpleGrid from '../../models/transform/SimpleGrid'

$(document).on('click', 'ul.ds-theme-menu li a', function(e) {
  let target = $(e.target).parent()
  let theme = target.attr('data-ds-theme-name')

  let u = new URI(window.location)
  u.setSearch('theme', theme)
  window.location = u.toString()

  
  app.refresh_mode()
  return false
})
