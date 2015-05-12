import * as app from './app'
import manager from './manager'

declare var Mousetrap

/* =============================================================================
   Keyboard Shortcuts
   ============================================================================= */

Mousetrap.bind('ctrl+shift+d', function(e) {
  app.toggle_mode(app.Mode.DISPLAY)
})

Mousetrap.bind('ctrl+shift+e', function(e) {
  app.toggle_mode(app.Mode.EDIT)
})

Mousetrap.bind('ctrl+shift+s', function(e) {
  manager.update_definition(manager.current.dashboard, function() {
    manager.success('Dashboard saved')
  })
})
