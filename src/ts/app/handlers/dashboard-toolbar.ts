import * as app from '../app'
import manager from '../manager'
import { make } from '../../models/items/factory'

declare var $, marked, ts

/*
 * Logic for the dashboard-toolbar.html template.
 */

app.add_mode_handler('edit', {
  enter: function() {
    $(".ds-dashboard-info-edit-panel").html(ts.templates.edit.dashboard_panel(manager.current.dashboard))
    $('#ds-edit-info-button').addClass('active')

      $.fn.editable.defaults.mode = 'inline'

      /** Title */
      $("#ds-info-panel-edit-title").editable({
        unsavedclass: null,
        success: function(ignore, newValue) {
          manager.current.dashboard.title = newValue
          manager.update(manager.current.dashboard)
        }
      })

      /** Category */
      $("#ds-info-panel-edit-category").editable({
        unsavedclass: null,
        success: function(ignore, newValue) {
          manager.current.dashboard.category = newValue
          manager.update(manager.current.dashboard)
        }
      })

      $("#ds-info-panel-edit-summary").editable({
        unsavedclass: null,
        success: function(ignore, newValue) {
          manager.current.dashboard.summary = newValue
          manager.update(manager.current.dashboard)
        }
      })

      $("#ds-info-panel-edit-description").editable({
        unsavedclass: null,
        value: manager.current.dashboard.description || '',
        success: function(ignore, newValue) {
          manager.current.dashboard.description = newValue
          manager.update(manager.current.dashboard)
        },
        display: function(value, response) {
          $(this).html(marked(value))
        }
      })

      let tags = manager.current.dashboard.tags || []
      $("#ds-info-panel-edit-tags").tagsManager({
        hiddenTagListName: 'ds-info-panel-edit-taglist',
        tagClass: 'badge badge-primary',
        prefilled: tags.map(function(tag) {
                     return tag.name
                   })
      })

    /**
     * Handler for tag changes. This gets run each time a complete tag
     * is added or removed.
     */
    $('[name="ds-info-panel-edit-taglist"]').on('change', function(e) {
      let tags = $('#ds-info-panel-edit-tags').tagsManager('tags')
      manager.current.dashboard.set_tags(tags)
      manager.update(manager.current.dashboard)
    })

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
    app.toggle_mode(app.Mode.EDIT)
  })

  $(document).on('click', '#ds-toggle-interactive-button', function(e) {
    if (manager.toggle_interactive_charts()) {
      $('#ds-toggle-interactive-button').removeClass('active')
    } else {
      $('#ds-toggle-interactive-button').addClass('active')
    }
  })

  $(document).on('click', '#ds-enter-fullscreen-button', function(e) {
    app.switch_to_mode(app.Mode.DISPLAY)
  })

  $(document).on('click', '#ds-exit-display-mode-button', function(e) {
    app.switch_to_mode(app.Mode.STANDARD)
  })

  $(document).on('click', '#ds-delete-dashboard-button', function(e) {
    manager.delete_current()
  })

  $(document).on('click', '#ds-remove-transform-button', function(e) {
    manager.remove_transform()
  })

  $(document).on('click', '#ds-save-dashboard-button', function(e) {
    manager.update_definition(manager.current.dashboard, function() {
      manager.success('Dashboard saved')
    })
  })

  $(document).on('click', '#ds-new-section-button', function(e) {
    let dash = manager.current.dashboard
    dash.definition.add(make('section'))
    dash.update_index()
  })

  $(document).on('click', '#ds-view-dashboard-source-button', function(e) {
    let dashboard = manager.current.dashboard
    $.get(dashboard.href + '?definition=true', function(data) {
      let contents = '<div class="container">' + ts.templates.edit.item_source({item:data}) + '</div>'
      $(manager.current.element).html(contents)
    })
  })

})
