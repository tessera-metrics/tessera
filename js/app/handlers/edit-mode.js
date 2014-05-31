ds.app.add_mode_handler(ds.app.Mode.EDIT, {
  enter: function() {
    $('.ds-section, .ds-cell, .ds-row').addClass('ds-edit')
  },
  exit: function() {
    $('.ds-section, .ds-cell, .ds-row').removeClass('ds-edit')
  }
})

/* -----------------------------------------------------------------------------
   Cell actions
   ----------------------------------------------------------------------------- */

ds.actions.register('edit-bar-cell', [
  ds.models.action({
    name:    'move-left',
    display: 'Move cell left in row',
    icon:    'fa fa-caret-left',
    handler: function(action, cell) {
      /** TODO **/
    }
  }),
  ds.models.action({
    name:    'move-right',
    display: 'Move cell right in row',
    icon:    'fa fa-caret-right',
    handler: function(action, cell) {
      /** TODO **/
    }
  }),
  ds.models.action({
    name:    'increase-span',
    display: 'Increase cell span by one',
    icon:    'fa fa-plus',
    handler: function(action, cell) {
      /** TODO **/
    }
  }),
  ds.models.action({
    name:    'decrease-span',
    display: 'Decrease cell span by one',
    icon:    'fa fa-minus',
    handler: function(action, cell) {
      /** TODO **/
    }
  }),
  ds.models.action({
    name:    'delete',
    display: 'Delete row',
    icon:    'fa fa-trash-o',
    handler: function(action, cell) {
      /** TODO **/
    }
  })
])

/* -----------------------------------------------------------------------------
   Row actions
   ----------------------------------------------------------------------------- */

ds.actions.register('edit-bar-row', [
  ds.models.action({
    name:    'move-up',
    display: 'Move row up in section',
    icon:    'fa fa-caret-up',
    handler: function(action, cell) {
      /** TODO **/
    }
  }),
  ds.models.action({
    name:    'move-down',
    display: 'Move row down in section',
    icon:    'fa fa-caret-down',
    handler: function(action, cell) {
      /** TODO **/
    }
  }),
  ds.models.action({
    name:    'delete',
    display: 'Delete row',
    icon:    'fa fa-trash-o',
    handler: function(action, cell) {
      /** TODO **/
    }
  })
])

/* -----------------------------------------------------------------------------
   Section actions
   ----------------------------------------------------------------------------- */

ds.actions.register('edit-bar-section', [
  ds.models.action({
    name:    'move-up',
    display: 'Move section up in dashboard',
    icon:    'fa fa-caret-up',
    handler: function(action, cell) {
      /** TODO **/
    }
  }),
  ds.models.action({
    name:    'move-down',
    display: 'Move section down in dashboard',
    icon:    'fa fa-caret-down',
    handler: function(action, cell) {
      /** TODO **/
    }
  }),
  ds.models.action({
    name:    'delete',
    display: 'Delete section',
    icon:    'fa fa-trash-o',
    handler: function(action, cell) {
      /** TODO **/
    }
  })
])

$(document).on('click', '.ds-edit-bar button', function(event) {
  var element  = $(this)[0]
  var parent   = $(this).parent()[0]
  var item_id  = parent.getAttribute('data-ds-item-id')
  var name     = element.getAttribute('data-ds-action')
  var category = element.getAttribute('data-ds-category')
  var action   = ds.actions.get(category, name)
  var item     = ds.manager.current.dashboard.get_item(item_id)

  console.log('Applying action ' + category + '/' + name + ' to item ' + item.item_type + '/' + item_id)
  action.handler(action, item)
})
