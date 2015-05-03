ts.app.add_mode_handler('display', {
  enter: function() {
    /* Make sure the fullscreen range indicator is correct */
    var range       = ts.context()
    var description = ds.manager.getRangeDescription(range.from);
    if ( description ) {
      $("a.ds-fullscreen-range-indicator").text(description);
    }
    /* Update the header to match the dashboard if it's fluid */
    var fluid = false
    ds.manager.current.dashboard.definition.visit(function(item) {
      if (item.layout === 'fluid')
        fluid = true
    })
    if (fluid) {
      $('.ds-header-container').removeClass('container')
      $('.ds-header-container').addClass('container-fluid')
    }
  },
  exit: function() {
    $('.ds-header-container').removeClass('container-fluid')
    $('.ds-header-container').addClass('container')
  }
})
