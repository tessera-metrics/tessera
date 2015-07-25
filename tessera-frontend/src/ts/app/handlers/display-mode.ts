import manager from '../manager'
import * as app from '../app'

declare var $

app.add_mode_handler('display', {
  enter: function() {
    /* Make sure the fullscreen range indicator is correct */
    let range       = app.context()
    let description = manager.getRangeDescription(range.from);
    if ( description ) {
      $("a.ds-fullscreen-range-indicator").text(description);
    }
    /* Update the header to match the dashboard if it's fluid */
    let fluid = false
    manager.current.dashboard.definition.visit(function(item) {
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
