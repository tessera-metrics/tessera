/* =============================================================================
   Keyboard Shortcuts
   ============================================================================= */

Mousetrap.bind('ctrl+shift+d', function(e) {
  ts.app.toggle_mode(ts.app.Mode.DISPLAY)
})

Mousetrap.bind('ctrl+shift+e', function(e) {
  ts.app.toggle_mode(ts.app.Mode.EDIT)
})

Mousetrap.bind('ctrl+shift+s', function(e) {
  ts.manager.update_definition(ts.manager.current.dashboard, function() {
    ts.manager.success('Dashboard saved')
  })
})
