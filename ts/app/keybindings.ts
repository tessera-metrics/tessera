/* =============================================================================
   Keyboard Shortcuts
   ============================================================================= */

Mousetrap.bind('ctrl+shift+d', function(e) {
  ds.app.toggle_mode(ds.app.Mode.DISPLAY)
})

Mousetrap.bind('ctrl+shift+e', function(e) {
  ds.app.toggle_mode(ds.app.Mode.EDIT)
})

Mousetrap.bind('ctrl+shift+s', function(e) {
  ds.manager.update_definition(ds.manager.current.dashboard, function() {
    ds.manager.success('Dashboard saved')
  })
})
