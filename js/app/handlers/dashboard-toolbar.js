ds.app.add_mode_handler('edit', {
  enter: function() {
    $(".ds-dashboard-info-edit-panel").html(ds.templates.edit.info_panel(ds.manager.current.dashboard));
    $('#ds-edit-info-button').addClass('active')
  },
  exit: function() {
    $('#ds-edit-info-button').removeClass('active')
  }
})

$(document).ready(function() {

  /**
   * Handlers for the Info Edit panel.
   */
  $(document).on('click', '#ds-edit-info-button', function(e) {

    if (ds.app.toggle_mode(ds.app.Mode.EDIT)) {
      $.fn.editable.defaults.mode = 'inline'

      /** Title */
      $("#ds-info-panel-edit-title").editable({
        unsavedclass: null,
        success: function(ignore, newValue) {
          ds.manager.current.dashboard.title = newValue
          var dash = ds.manager.current.dashboard.toJSON()
          delete dash.definition
          ds.manager.update(dash)
        }
      })

      /** Category */
      $("#ds-info-panel-edit-category").editable({
        unsavedclass: null,
        success: function(ignore, newValue) {
          ds.manager.current.dashboard.category = newValue
          var dash = ds.manager.current.dashboard.toJSON()
          delete dash.definition
          ds.manager.update(dash)
        }
      })

      $("#ds-info-panel-edit-summary").editable({
        unsavedclass: null,
        success: function(ignore, newValue) {
          ds.manager.current.dashboard.summary = newValue
          var dash = ds.manager.current.dashboard.toJSON()
          delete dash.definition
          ds.manager.update(dash)
        }
      })

      $("#ds-info-panel-edit-description").editable({
        unsavedclass: null,
        value: ds.manager.current.dashboard.description || '',
        success: function(ignore, newValue) {
          ds.manager.current.dashboard.description = newValue
          var dash = ds.manager.current.dashboard.toJSON()
          delete dash.definition
          ds.manager.update(dash)
        },
        display: function(value, response) {
          $(this).html(marked(value))
        }
      })

      var tags = ds.manager.current.dashboard.tags || []
      $("#ds-info-panel-edit-tags").tagsManager({
        hiddenTagListName: 'ds-info-panel-edit-taglist',
        tagClass: 'badge badge-primary',
        prefilled: tags.map(function(tag) {
                     return tag.name
                   })
      })

    }
  })

  /**
   * Handler for tag changes. This gets run each time a complete tag
   * is added or removed.
   */
  $(document).on('change', '[name="ds-info-panel-edit-taglist"]', function(e) {
    var tags = $('#ds-info-panel-edit-tags').tagsManager('tags');
    ds.manager.current.dashboard.set_tags(tags);

    // TODO: this snippet is repeated all over (above). Consolidate to
    // an update_metadata() on ds.manager or somesuch (i.e. update w/o
    // definition)
    var dash = ds.manager.current.dashboard.toJSON()
    delete dash.definition
    ds.manager.update(dash)
  })

  $(document).on('click', '#ds-toggle-interactive-button', function(e) {
    if (ds.manager.toggle_interactive_charts()) {
      $('#ds-toggle-interactive-button').removeClass('active')
    } else {
      $('#ds-toggle-interactive-button').addClass('active')
    }
  })

  $(document).on('click', '#ds-enter-fullscreen-button', function(e) {
    ds.app.switch_to_mode(ds.app.Mode.DISPLAY)
  })

  $(document).on('click', '#ds-exit-display-mode-button', function(e) {
    ds.app.switch_to_mode(ds.app.Mode.STANDARD)
  })

  $(document).on('click', '#ds-delete-dashboard-button', function(e) {
    ds.manager.delete_current()
  })

  $(document).on('click', '#ds-view-dashboard-source-button', function(e) {
    var dashboard = ds.manager.current.dashboard;
    $.get(dashboard.href + '?definition=true', function(data) {
      var contents = '<div class="container">' + ds.templates.edit.item_source({item:data.dashboards[0]}) + '</div>'
      $(ds.manager.current.element).html(contents)
    })
  })

})
