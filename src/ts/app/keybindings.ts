import { logger } from '../core/log'
import * as app from './app'
import manager from './manager'

declare var Mousetrap

const log = logger('keys')

/* =============================================================================
   Keyboard Shortcuts
   ============================================================================= */

Mousetrap.bind('ctrl+shift+d', function(e) {
  log.debug('ctrl+shift+d')
  app.toggle_mode(app.Mode.DISPLAY)
})

Mousetrap.bind('ctrl+shift+e', function(e) {
  log.debug('ctrl+shift+e')
  app.toggle_mode(app.Mode.EDIT)
})

Mousetrap.bind('ctrl+shift+s', function(e) {
  log.debug('ctrl+shift+s')
  manager.update_definition(manager.current.dashboard, function() {
    manager.success('Dashboard saved')
  })
})
