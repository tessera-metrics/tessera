/**
 * Actions that operate on dashboard in the listing page, and the
 * handler to invoke them from the dashboard-list.html template.
 */

ts.actions.register('dashboard-list-actions', [
  new ts.Action({
    name:    'open',
    display: 'Open',
    icon:    'fa fa-external-link',
    handler: function(action, context) {
      window.location = context.view_href
    }
  }),
  new ts.Action({
    name:    'edit',
    display: 'Edit...',
    icon:    'fa fa-edit',
    handler: function(action, context) {
      var url = new URI(context.view_href).setQuery('mode', ts.app.Mode.EDIT).href()
      window.location = url
    }
  }),
  new ts.Action({
    name:    'duplicate',
    display: 'Duplicate...',
    icon:    'fa fa-copy',
    handler: function(action, context) {
      ts.manager.duplicate(context.href, function() {
        window.location.reload()
      })
    }
  }),
  new ts.Action({
    divider: true
  }),
  new ts.Action({
    name:    'delete',
    display: 'Delete...',
    icon:    'fa fa-trash-o',
    handler: function(action, context) {
      ts.manager.delete_with_confirmation(context.href, function() {
        $('tr[data-ds-href="' + context.href + '"]').remove()
        ts.manager.success('Succesfully deleted dashboard ' + context.href)
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
  var action = ts.actions.get('dashboard-list-actions', this.getAttribute('data-ds-action'))
  action.handler(action, context)
})
