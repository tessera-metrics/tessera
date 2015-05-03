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
  ds.manager.update_definition(ds.manager.current.dashboard, function() {
    ds.manager.success('Dashboard saved')
  })
})
