(function () {

  /**
   * Helper functions to show & hide the action bar & property sheet
   * for dashboard items.
   */

  function toggle_details(item_id) {
    var details = $('#' + item_id + '-details')
    if (details.is(':visible')) {
      hide_details(item_id)
    } else {
      show_details(item_id)
    }
  }

  function hide_details(item_id) {
    var details = $('#' + item_id + '-details')
    details.fadeOut()
  }

  function show_details(item_id) {
    var details = $('#' + item_id + '-details')
    details.fadeIn()
    var item = ds.manager.current.dashboard.get_item(item_id)
    if (item.interactive_properties) {
      var props = item.interactive_properties()
      for (var i in props) {
        var prop = props[i]
          var ns = ds.templates.edit.properties
        if (prop && ns[prop.name] && ns[prop.name].editHandler) {
          ns[prop.name].editHandler(prop, item)
        }
      }
    }
  }

  /**
   * Event handlers to show & hide the action bar & property sheet for
   * dashboard items.
   */

  $(document).on('mouseenter', '.ds-edit-bar .badge', function(event) {
    $(this).addClass('ds-badge-highlight')
    var id = $(this).attr('data-ds-item-id')
    $('.ds-edit-bar[data-ds-item-id="' + id + '"] .btn-group').fadeIn()
    show_details(id)
  })

  $(document).on('mouseleave', '.ds-edit-bar', function(event) {
    var id = $(this).attr('data-ds-item-id')
    $('.ds-edit-bar[data-ds-item-id="' + id + '"] .btn-group').fadeOut()
    $('.ds-edit-bar[data-ds-item-id="' + id + '"] .badge').removeClass('ds-badge-highlight')
    hide_details(id)
  })

  /**
   * Toggle mode-specific CSS rules for dashboard structural elements.
   */

  ds.app.add_mode_handler(ds.app.Mode.EDIT, {
    enter: function() {
      $('.ds-section, .ds-cell, .ds-row').addClass('ds-edit')
    },
    exit: function() {
      $('.ds-section, .ds-cell, .ds-row').removeClass('ds-edit')
    }
  })

  function widen(action, item) {
    if (item.span) {
      item.span += 1
      ds.manager.update_item_view(ds.manager.current.dashboard.find_parent(item))
    }
  }

  function narrow(action, item) {
    if (item.span) {
      item.span -= 1
      ds.manager.update_item_view(ds.manager.current.dashboard.find_parent(item))
    }
  }

  var new_item_action = ds.models.action({
    name:    'add',
    display: 'Add new item...',
    icon:    'fa fa-plus',
    handler: function(action, container) {
    }
  })

  var item_properties_action = ds.models.action({
    name:    'properties',
    display: 'Properties',
    icon:    'fa fa-edit',
    handler: function(action, item) {
      toggle_details(item_id)
    }
  })

  var duplicate_item_action = ds.models.action({
    name:    'duplicate',
    display: 'Duplicate Item',
    icon:    'fa fa-copy',
    handler: function(action, item) {
      var dashboard = ds.manager.current.dashboard
      var parent = dashboard.find_parent(item)
      var dup = ds.models.factory(item.toJSON())
      dup.visit(function(item) {
        item.item_id = undefined
      })
      parent.add(dup) /** TODO: adding immediately after the source item would be nice */
      dashboard.update_index()
      ds.manager.update_item_view(parent)
    }
  })

  var delete_action = ds.models.action({
    name:    'delete',
    display: 'Delete item',
    icon:    'fa fa-trash-o',
    handler:  function(action, item) {
      var parent = ds.manager.current.dashboard.find_parent(item)
      if (!parent) {
        return
      }
      if (parent && parent.is_container && parent.remove(item)) {
        ds.manager.update_item_view(parent)
      }
    }
  })

  var move_back_action = ds.models.action({
    name:    'move-back',
    display: 'Move item back one place',
    icon:    'fa fa-caret-left',
    handler:  function(action, item) {
      var parent = ds.manager.current.dashboard.find_parent(item)
      if (parent.is_container && parent.move(item, -1)) {
        ds.manager.update_item_view(parent)
      }
    }
  })

  var move_forward_action = ds.models.action({
    name:    'move-forward',
    display: 'Move item forward one place',
    icon:    'fa fa-caret-right',
    handler:  function(action, item) {
      var parent = ds.manager.current.dashboard.find_parent(item)
      if (parent.is_container && parent.move(item, 1)) {
        ds.manager.update_item_view(parent)
      }
    }
  })

  var view_definition_action = ds.models.action({
    name:    'view-definition',
    display: 'View definition...',
    icon:    'fa fa-code',
    handler: function(action, item) {
      var contents = ds.templates.edit.item_source({item:item})
      bootbox.alert(contents)
    }
  })

  /* -----------------------------------------------------------------------------
     Cell actions
     ----------------------------------------------------------------------------- */

  ds.actions.register('edit-bar-cell', [
    new_item_action,
    duplicate_item_action,
    view_definition_action,
    ds.models.action.divider,
    move_back_action,
    move_forward_action,
    ds.models.action({
      name:    'increase-span',
      display: 'Increase cell span by one',
      icon:    'fa fa-expand',
      handler:  widen
    }),
    ds.models.action({
      name:    'decrease-span',
      display: 'Decrease cell span by one',
      icon:    'fa fa-compress',
      handler:  narrow
    }),
    ds.models.action.divider,
    delete_action
  ])

  /* -----------------------------------------------------------------------------
     Row actions
     ----------------------------------------------------------------------------- */

  ds.actions.register('edit-bar-row', [
    new_item_action,
    duplicate_item_action,
    ds.models.action.divider,
    move_back_action,
    move_forward_action,
    ds.models.action.divider,
    delete_action
  ])

  /* -----------------------------------------------------------------------------
     Section actions
     ----------------------------------------------------------------------------- */

  ds.actions.register('edit-bar-section', [
    new_item_action,
    duplicate_item_action,
    ds.models.action.divider,
    move_back_action,
    move_forward_action,
    ds.models.action.divider,
    delete_action
  ])

  /* -----------------------------------------------------------------------------
     Item actions
     ----------------------------------------------------------------------------- */

  ds.actions.register('edit-bar-item', [
    duplicate_item_action,
    ds.models.action.divider,
    move_back_action,
    move_forward_action,
    view_definition_action,
    ds.models.action.divider,
    delete_action
  ])


  /* -----------------------------------------------------------------------------
     Edit Bar Handler
     ----------------------------------------------------------------------------- */

  $(document).on('click', '.ds-edit-bar button', function(event) {
    var element  = $(this)[0]
    var parent   = $(this).parent()[0]
    var item_id  = parent.getAttribute('data-ds-item-id')
    var name     = element.getAttribute('data-ds-action')
    var category = element.getAttribute('data-ds-category')
    var action   = ds.actions.get(category, name)
    var item     = ds.manager.current.dashboard.get_item(item_id)

    if (action) {
      action.handler(action, item)
    }
  })

  /* -----------------------------------------------------------------------------
     Dashboard Query Panel
     ----------------------------------------------------------------------------- */

  ds.actions.register('dashboard-queries', [
    ds.models.action({
      name:    'new-query',
      display: 'New Query...',
      icon:    'fa fa-plus',
      handler:  function(action) {
      }
    })
  ])

})()
