ds.app.add_mode_handler('display', {
  enter: function() {
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
