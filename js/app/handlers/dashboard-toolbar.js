$(document).ready(function() {

  /**
   * Handlers for the Info Edit panel.
   */
  $(document).on('click', '#ds-edit-info-button', function(e) {

    if (cronenberg.toggleEditMode().editing) {
      $.fn.editable.defaults.mode = 'inline';

      /** Title */
      $("#ds-info-panel-edit-title").editable({
        unsavedclass: null,
        success: function(ignore, newValue) {
          var dash = ds.manager.current.dashboard.toJSON();
          delete dash.definition;
          dash.title = newValue;
          ds.manager.update(dash);
        }
      });

      /** Category */
      $("#ds-info-panel-edit-category").editable({
        unsavedclass: null,
        success: function(ignore, newValue) {
          var dash = ds.manager.current.dashboard.toJSON();
          delete dash.definition;
          dash.category = newValue;
          ds.manager.update(dash);
        }
      });

      $("#ds-info-panel-edit-summary").editable({
        unsavedclass: null,
        success: function(ignore, newValue) {
          var dash = ds.manager.current.dashboard.toJSON();
          delete dash.definition;
          dash.summary = newValue;
          ds.manager.update(dash);
        }
      });

      $("#ds-info-panel-edit-description").editable({
        unsavedclass: null,
        value: ds.manager.current.dashboard.description || '',
        success: function(ignore, newValue) {
          var dash = ds.manager.current.dashboard.toJSON();
          delete dash.definition;
          dash.description = newValue;
          ds.manager.update(dash);
        },
        display: function(value, response) {
          $(this).html(markdown.toHTML(value));
        }
      });
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
