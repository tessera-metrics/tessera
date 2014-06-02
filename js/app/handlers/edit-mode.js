(function () {

ds.app.add_mode_handler(ds.app.Mode.EDIT, {
  enter: function() {
    $('.ds-section, .ds-cell, .ds-row').addClass('ds-edit')
  },
  exit: function() {
    $('.ds-section, .ds-cell, .ds-row').removeClass('ds-edit')
  }
})

  function move_up(action, item) {
      var parent = ds.manager.current.dashboard.find_parent(item)
      if (parent.is_container && parent.move(item, 1)) {
        ds.manager.update_item_view(parent)
      }
  }

  function move_down(action, item) {
      var parent = ds.manager.current.dashboard.find_parent(item)
      if (parent.is_container && parent.move(item, -1)) {
        ds.manager.update_item_view(parent)
      }
  }

  function remove(action, item) {
    var parent = ds.manager.current.dashboard.find_parent(item)
    if (!parent) {
      return
    }
    if (parent && parent.is_container && parent.remove(item)) {
      ds.manager.update_item_view(parent)
    }
  }

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
      var details = $('#' + item.item_id + '-details')
      if (details.is(':visible')) {
        details.fadeOut()
      } else {
        details.fadeIn()
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
      /** TODO: need to generate unique IDs for the duplicate before we can add it to the DOM */
    }
  })

/* -----------------------------------------------------------------------------
   Cell actions
   ----------------------------------------------------------------------------- */

ds.actions.register('edit-bar-cell', [
  new_item_action,
  item_properties_action,
  duplicate_item_action,
  ds.models.action.divider,
  ds.models.action({
    name:    'move-left',
    display: 'Move cell left in row',
    icon:    'fa fa-caret-left',
    handler:  move_down
  }),
  ds.models.action({
    name:    'move-right',
    display: 'Move cell right in row',
    icon:    'fa fa-caret-right',
    handler:  move_up
  }),
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
  ds.models.action({
    name:    'delete',
    display: 'Delete row',
    icon:    'fa fa-trash-o',
    handler:  remove
  })
])

/* -----------------------------------------------------------------------------
   Row actions
   ----------------------------------------------------------------------------- */

ds.actions.register('edit-bar-row', [
  new_item_action,
  item_properties_action,
  duplicate_item_action,
  ds.models.action.divider,
  ds.models.action({
    name:    'move-up',
    display: 'Move row up in section',
    icon:    'fa fa-caret-up',
    handler:  move_down
  }),
  ds.models.action({
    name:    'move-down',
    display: 'Move row down in section',
    icon:    'fa fa-caret-down',
    handler:  move_up
  }),
  ds.models.action.divider,
  ds.models.action({
    name:    'delete',
    display: 'Delete row',
    icon:    'fa fa-trash-o',
    handler:  remove
  })
])

/* -----------------------------------------------------------------------------
   Section actions
   ----------------------------------------------------------------------------- */

ds.actions.register('edit-bar-section', [
  new_item_action,
  item_properties_action,
  duplicate_item_action,
  ds.models.action.divider,
  ds.models.action({
    name:    'move-up',
    display: 'Move section up in dashboard',
    icon:    'fa fa-caret-up',
    handler:  move_down
  }),
  ds.models.action({
    name:    'move-down',
    display: 'Move section down in dashboard',
    icon:    'fa fa-caret-down',
    handler:  move_up
  }),
  ds.models.action.divider,
  ds.models.action({
    name:    'delete',
    display: 'Delete section',
    icon:    'fa fa-trash-o',
    handler:  remove
  })
])

/* -----------------------------------------------------------------------------
   Item actions
   ----------------------------------------------------------------------------- */

ds.actions.register('edit-bar-item', [
  item_properties_action,
  duplicate_item_action,
  ds.models.action({
    name:    'view-definition',
    display: 'View definition...',
    icon:    'fa fa-code',
    handler: function(action, item) {
      var contents = ds.templates.edit.item_source({item:item})
      bootbox.alert(contents)
    }
  }),
  ds.models.action.divider,
  ds.models.action({
    name:    'delete',
    display: 'Delete item',
    icon:    'fa fa-trash-o',
    handler:  remove
  })
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
