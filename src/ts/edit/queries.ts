import * as core from '../core'
import Query from '../models/data/Query'
import Dashboard from '../models/dashboard'
import manager from '../app/manager'
import * as app from '../app/app'

declare var $, bootbox, ts
const log = core.logger('edit')

/* -----------------------------------------------------------------------------
   Query Functions
   ----------------------------------------------------------------------------- */

/**
 * Rename a query and update the UI to reflect the change.
 */
export function rename_query(dashboard: Dashboard, old_name: string, new_name: string) : void {
  log.debug('rename_query()')
  let query         = dashboard.definition.queries[old_name]
  let updated_items = dashboard.definition.rename_query(old_name, new_name)
  $('[data-ds-query-name="' + old_name + '"]').replaceWith(
    ts.templates.edit['dashboard-query-row'](query)
  )
  if (updated_items && updated_items.length) {
    for (let item of updated_items) {
      manager.update_item_view(item)
    }
  }
  edit_queries()
  app.refresh_mode()
}

/**
 * Delete a query and remove it from the queries list in the UI.
 */
export function delete_query(dashboard: Dashboard, query_name: string) : void {
  log.debug('delete_query()')
  dashboard.definition.delete_query(query_name)
  $('tr[data-ds-query-name="' + query_name + '"]').remove()
  edit_queries()
  app.refresh_mode()
}

/**
 * Add a new query to the dashboard and UI.
 */
export function add_query(dashboard: Dashboard, name: string, target?) : Query {
  log.debug('add_query()')
  let query = new Query({name: name, targets: target})
  dashboard.definition.add_query(query)
  $("#ds-query-panel table").append(ts.templates.edit['dashboard-query-row'](query))
  query.load()
  edit_queries()
  return query
}

export function duplicate_query(dashboard: Dashboard, name: string) : Query {
  log.debug('duplicate_query()')
  let new_name = `Copy of ${name} ` + Object.keys(dashboard.definition.queries).length
  let source   = dashboard.definition.queries[name]
  return add_query(dashboard, new_name, source.targets.slice(0))
}

/**
 * Add a new query object to the dashboard and UI with an
 * auto-generated unique name, and an optional set of targets. If
 * targets are not supplied, a function generating random data will
 * be used as a placeholder.
 */
export function new_query(dashboard: Dashboard, targets?) : Query {
  log.debug('new_query()')
  let name = "query" + Object.keys(dashboard.definition.queries).length
  return add_query(dashboard, name, targets || `absolute(randomWalkFunction("${name}"))`)
}

export function edit_queries() : void {
  log.debug('edit_queries()')
  /* Query names */
  $('th.ds-query-name').each(function(index, e) {
    let element    = $(e)
    let query_name = e.getAttribute('data-ds-query-name')
    element.editable({
      type: 'text',
      value: query_name,
      success: function(ignore, newValue) {
        rename_query(manager.current.dashboard, query_name, newValue)
      }
    })
  });
  /* Query targets */
  $('td.ds-query-target').each(function(index, e) {
    let element    = $(e)
    let query_name = e.getAttribute('data-ds-query-name')
    element.editable({
      type: 'textarea',
      inputclass: 'ds-source',
      value: element.text() || '',
      success: function(ignore, newValue) {
        let target = newValue.trim()
        let query = manager.current.dashboard.definition.queries[query_name]
        query.targets = [target]
        query.render_templates(app.context().variables)
        query.load()
      }
    })
  });
}

/* -----------------------------------------------------------------------------
   Query Event Handlers
   ----------------------------------------------------------------------------- */

/* Query delete buttons */
$(document).on('click', 'button.ds-delete-query-button', function(e) {
  log.debug('click.delete-query')
  let $elt       = $(this)
  let query_name = $elt.attr('data-ds-query-name')
  let dashboard  = manager.current.dashboard
  if (!dashboard.definition.queries[query_name]) {
    return true
  }
  let queries_in_use = dashboard.definition.get_queries()
  if (queries_in_use[query_name]) {
    bootbox.dialog({
      backdrop: false,
      message: `Query ${query_name} is in use. Are you sure you want to delete it?`,
      title: 'Confirm query delete',
      buttons: {
        cancel: {
          label: 'Cancel',
          className: 'btn-default'
        },
        confirm: {
          label: 'Delete',
          className: 'btn-danger',
          callback: function() {
            delete_query(dashboard, query_name)
          }
        }
      }
    })
  } else {
    delete_query(dashboard, query_name)
  }
  return true
})

/* Query duplicate buttons */
$(document).on('click', 'button.ds-duplicate-query-button', function(e) {
  log.debug('click.duplicate-query')
  let $elt       = $(this)
  let query_name = $elt.attr('data-ds-query-name')
  let dashboard  = manager.current.dashboard
  if (!dashboard.definition.queries[query_name]) {
    return true
  }
  duplicate_query(dashboard, query_name)
  return true
})

$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function(e) {
  log.debug('shown.bs.tab ' + e.target.href)
  if (e.target.id == 'ds-edit-tab-queries') {
    edit_queries()
  }
})

/* -----------------------------------------------------------------------------
   Dashboard Query Panel
   ----------------------------------------------------------------------------- */

core.actions.register('dashboard-queries', [
  new core.Action({
    name:    'new-query',
    display: 'New Query...',
    icon:    'fa fa-plus',
    handler:  function(action, dashboard) {
      new_query(dashboard)
    }
  })
])

$(document).on('click', '#ds-query-panel button', function(event) {
  let element  = $(this)[0]
  let name     = element.getAttribute('data-ds-action')
  let action   = core.actions.get('dashboard-queries', name)

  if (action) {
    action.handler(action, manager.current.dashboard)
  }
})
