$(document).ready(function() {

  $(document).on('click', '#ds-edit-info-button', function(e) {
    if (cronenberg.toggleEditMode().editing) {
      $.fn.editable.defaults.mode = 'inline';
      $(".ds-editable").editable();
    }
  });


  $(document).on('click', '#ds-toggle-interactive-button', function(e) {
    if (ds.manager.toggle_interactive_charts()) {
      $('#ds-toggle-interactive-button').removeClass('active');
    } else {
      $('#ds-toggle-interactive-button').addClass('active');
    }
  });

  $(document).on('click', '#ds-enter-fullscreen-button', function(e) {
    cronenberg.enterFullScreen();
  });

  $(document).on('click', '#ds-delete-dashboard-button', function(e) {
    ds.manager.delete_current();
  });


  cronenberg.onEnterEditMode(function() {
    $('#ds-edit-button').addClass('active');
  }).onExitEditMode(function() {
    $('#ds-edit-button').removeClass('active');
  });

});
