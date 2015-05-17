import Action, { actions } from '../../core/action'
import manager from '../manager'
import * as app from '../app'

declare var $, URI

/**
 * Actions that operate on dashboard in the listing page, and the
 * handler to invoke them from the dashboard-list.html template.
 */

actions.register('dashboard-list-actions', [
  new Action({
    name:    'open',
    display: 'Open',
    icon:    'fa fa-external-link',
    handler: function(action, context) {
      window.location = context.view_href
    }
  }),
  new Action({
    name:    'edit',
    display: 'Edit...',
    icon:    'fa fa-edit',
    handler: function(action, context) {
      let url = new URI(context.view_href).setQuery('mode', app.Mode.EDIT).href()
      window.location = url
    }
  }),
  new Action({
    name:    'duplicate',
    display: 'Duplicate...',
    icon:    'fa fa-copy',
    handler: function(action, context) {
      manager.duplicate(context.href, function() {
        window.location.reload()
      })
    }
  }),
  new Action({
    divider: true
  }),
  new Action({
    name:    'delete',
    display: 'Delete...',
    icon:    'fa fa-trash-o',
    handler: function(action, context) {
      manager.delete_with_confirmation(context.href, function() {
        $('tr[data-ds-href="' + context.href + '"]').remove()
        manager.success('Succesfully deleted dashboard ' + context.href)
      })
    }
  })
])

$(document).on('click', 'ul.ds-dashboard-action-menu li', function(event) {
  let element = $(event.target).parent().parent()[0]
  let context = {
    href: element.getAttribute('data-ds-href'),
    view_href: element.getAttribute('data-ds-view-href')
  }
  let action = actions.get('dashboard-list-actions', this.getAttribute('data-ds-action'))
  action.handler(action, context)
})
