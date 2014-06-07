/**
 * Actions that operate on dashboard in the listing page, and the
 * handler to invoke them from the dashboard-list.html template.
 */

ds.actions.register('dashboard-list-actions', [
  ds.models.action({
    name:    'open',
    display: 'Open',
    icon:    'fa fa-external-link',
    handler: function(action, context) {
      window.location = context.view_href
    }
  }),
  ds.models.action({
    name:    'edit',
    display: 'Edit...',
    icon:    'fa fa-edit',
    handler: function(action, context) {
      var url = URI(context.view_href).setQuery('mode', ds.app.Mode.EDIT).href()
      window.location = url
    }
  }),
  ds.models.action({
    name:    'duplicate',
    display: 'Duplicate...',
    icon:    'fa fa-copy',
    handler: function(action, context) {
      ds.manager.duplicate(context.href, function() {
        window.location.reload()
      })
    }
  }),
  ds.models.action({
    divider: true
  }),
  ds.models.action({
    name:    'delete',
    display: 'Delete...',
    icon:    'fa fa-trash-o',
    handler: function(action, context) {
      ds.manager.delete_with_confirmation(context.href, function() {
        $('tr[data-ds-href="' + context.href + '"]').remove()
        ds.manager.success('Succesfully deleted dashboard ' + context.href)
      })
    }
  })
])

$(document).on('click', 'ul.ds-dashboard-action-menu li', function(event) {
  var element = $(event.target).parent().parent()[0]
  var context = {
    href: element.getAttribute('data-ds-href'),
    view_href: element.getAttribute('data-ds-view-href')
  }
  var action = ds.actions.get('dashboard-list-actions', this.getAttribute('data-ds-action'))
  action.handler(action, context)
})
