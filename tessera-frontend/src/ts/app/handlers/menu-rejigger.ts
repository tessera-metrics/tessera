import manager from '../manager'
import * as app from '../app'
import SimpleGrid from '../../models/transform/SimpleGrid'

$(document).on('click', 'ul.ds-rejigger-menu li a', function(e) {
  let target = $(e.target).parent()
  let cols = target.attr('data-ds-cols')
  let section_type = target.attr('data-ds-section-type')

  let layout = new SimpleGrid({
    section_type: section_type,
    columns: cols
  })

  manager.apply_transform(layout, manager.current.dashboard, false)
  app.refresh_mode()
  return false
})
