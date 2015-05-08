import * as logging from '../core/log'
import * as app from '../app/app'
import manager from '../app/manager'
import Action, { actions } from '../core/action'
import Query from '../models/data/Query'
import Container from '../models/items/container'
import { make } from '../models/items/factory'

declare var $, bootbox, tessera

const log = logging.logger('tessera.edit')

/* -----------------------------------------------------------------------------
   Queries
   ----------------------------------------------------------------------------- */

/**
 * Rename a query and update the UI to reflect the change.
 */
export function rename_query(dashboard, old_name, new_name) {
  log.debug('rename_query()')
  let query         = dashboard.definition.queries[old_name]
  let updated_items = dashboard.definition.rename_query(old_name, new_name)
  $('[data-ds-query-name="' + old_name + '"]').replaceWith(
    tessera.templates.edit['dashboard-query-row'](query)
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
export function delete_query(dashboard, query_name) {
  log.debug('delete_query()')
  dashboard.definition.delete_query(query_name)
  $('tr[data-ds-query-name="' + query_name + '"]').remove()
  edit_queries()
  app.refresh_mode()
}

/**
 * Add a new query to the dashboard and UI.
 */
export function add_query(dashboard, name, target?) {
  log.debug('add_query()')
  let query = new Query({name: name, targets: target})
  dashboard.definition.add_query(query)
  $("#ds-query-panel table").append(tessera.templates.edit['dashboard-query-row'](query))
  query.load()
  edit_queries()
  return query
}

export function duplicate_query(dashboard, name) {
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
export function new_query(dashboard, targets?) {
  log.debug('new_query()')
  let name = "query" + Object.keys(dashboard.definition.queries).length
  return add_query(dashboard, name, targets || `absolute(randomWalkFunction("${name}"))`)
}

export function edit_queries() {
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
   Property Sheets
   ----------------------------------------------------------------------------- */

/**
 * Helper functions to show & hide the action bar & property sheet
 * for dashboard items.
 */
export function hide_details(item_id) {
  let details = $('#' + item_id + '-details')
  details.remove()
  $('.ds-edit-bar[data-ds-item-id="' + item_id + '"] .btn-group').hide()
  $('.ds-edit-bar[data-ds-item-id="' + item_id + '"] .badge').removeClass('ds-badge-highlight')
}

export function show_details(item_id) {
  // Show the edit button bar across the top of the item
  $('.ds-edit-bar[data-ds-item-id="' + item_id + '"] .btn-group').show()
  let item       = manager.current.dashboard.get_item(item_id)
  let bar_id     = '.ds-edit-bar[data-ds-item-id="' + item_id + '"]'
  let details_id = '#' + item_id + '-details'
  if ($(details_id).length == 0) {

    // Render the item's property sheet
    let elt     = $('.ds-edit-bar[data-ds-item-id="' + item_id + '"]')
    let details = tessera.templates['ds-edit-bar-item-details']({item:item})
    elt.append(details)

    if (item.meta.interactive_properties) {
      // Run the edit handlers for each property, which make them
      // editable and set up the callbacks for their updates
      for (let prop of item.meta.interactive_properties) {
        prop.edit(item)
      }
    }
  }
}

export function toggle_details(item_id) {
  let details = $('#' + item_id + '-details')
  if (details.is(':visible')) {
    hide_details(item_id)
    return false
  } else {
    show_details(item_id)
    return true
  }
}

export function details_visibility(item) {
  return $('#' + item.item_id + '-details').is(':visible')
}


/* -----------------------------------------------------------------------------
   Queries
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
   Property Sheets
   ----------------------------------------------------------------------------- */

/**
 * Event handlers to show & hide the action bar & property sheet for
 * dashboard items.
 */

$(document).on('click', '.ds-edit-bar .badge', function(event) {
  let $elt = $(this)
  let id   = $elt.attr('data-ds-item-id')
  if (toggle_details(id)) {
    $elt.addClass('ds-badge-highlight')
  } else {
    $elt.removeClass('ds-badge-highlight')
  }
})

$(document).on('mouseenter', '.ds-edit-bar', function(event) {
  let timeout_id = $(this).attr('data-ds-timeout-id')
  if (timeout_id) {
    window.clearTimeout(timeout_id)
  }
})

$(document).on('mouseleave', '.ds-edit-bar', function(event) {
  let $elt    = $(this)
  let id      = $elt.attr('data-ds-item-id')
  let timeout = app.config.PROPSHEET_AUTOCLOSE_SECONDS
  if (timeout) {
    let timeout_id = window.setTimeout(function() {
      hide_details(id)
    }, timeout * 1000)
    $elt.attr('data-ds-timeout-id', timeout_id)
  }
})

/**
 * Toggle mode-specific CSS rules for dashboard structural elements.
 */

app.add_mode_handler(app.Mode.EDIT, {
  enter: function() {
    log.debug('mode_handler.enter()')
    $('.ds-section, .ds-cell, .ds-row').addClass('ds-edit')
  },
  exit: function() {
    log.debug('mode_handler.exit()')
    $('.ds-section, .ds-cell, .ds-row').removeClass('ds-edit')
  },
  refresh: function() {
    log.debug('mode_handler.refresh()')
    $('.ds-section, .ds-cell, .ds-row').addClass('ds-edit')
  }
})

/* -----------------------------------------------------------------------------
   Item Actions
   ----------------------------------------------------------------------------- */

let duplicate_item_action = new Action({
  name:    'duplicate',
  display: 'Duplicate Item',
  icon:    'fa fa-copy',
  handler: function(action, item) {
    let dashboard = manager.current.dashboard
    let parent = dashboard.find_parent(item)
    let dup = make(item.toJSON()).set_item_id(null)
    dup.visit(function(child) {
      child.item_id = null
    })
    parent.add_after(item, dup)
    dashboard.update_index()
    manager.update_item_view(parent)
  }
})

let delete_action = new Action({
  name:    'delete',
  display: 'Delete item',
  icon:    'fa fa-trash-o',
  handler:  function(action, item) {
    let parent = manager.current.dashboard.find_parent(item)
    if (!parent) {
      return
    }
    if (parent && (parent instanceof Container) && parent.remove(item)) {
      manager.update_item_view(parent)
    }
  }
})

let move_back_action = new Action({
  name:    'move-back',
  display: 'Move item back one place',
  icon:    'fa fa-caret-left',
  handler:  function(action, item) {
    let parent = manager.current.dashboard.find_parent(item)
    if ((parent instanceof Container) && parent.move(item, -1)) {
      manager.update_item_view(parent)
    }
  }
})

let move_forward_action = new Action({
  name:    'move-forward',
  display: 'Move item forward one place',
  icon:    'fa fa-caret-right',
  handler:  function(action, item) {
    let parent = manager.current.dashboard.find_parent(item)
    if ((parent instanceof Container) && parent.move(item, 1)) {
      manager.update_item_view(parent)
    }
  }
})

let view_definition_action = new Action({
  name:    'view-definition',
  display: 'View definition...',
  icon:    'fa fa-code',
  handler: function(action, item) {
    let contents = tessera.templates.edit.item_source({item:item})
    bootbox.alert({
      backdrop: false,
      message: contents
    })
  }
})

/* -----------------------------------------------------------------------------
   New from Graphite URL Action
   ----------------------------------------------------------------------------- */

function new_chart_from_graphite_url(url_string) {
  let dash  = manager.current.dashboard
  let url   = new URI(url_string)
  let data  = url.search(true)
  let query = new_query(dash, data.target)
  let type  = 'standard_time_series'

  if (data.areaMode && data.areaMode === 'stacked') {
    type = 'stacked_area_chart'
  } else if (data.graphType && data.graphType === 'pie') {
    type = 'donut_chart'
  }

  let chart = make(type)
    .set_query(query.name)
    .set_dashboard(dash)
    .set_height(Math.min(8, Math.floor(((data.height || 400) / 80))))
    .set_title(data.title)

  if (data.vtitle) {
    chart.options = chart.options || {}
    chart.options.yAxisLabel = data.vtitle
  }

  if (data.template) {
    chart.options = chart.options || {}
    chart.options.palette = data.template
  }

  return chart
}

actions.register({
  name:      'new-chart-from-url',
  category:  'new-item-chart',
  display:   'Add new chart from Graphite URL',
  icon:      'fa fa-image',
  css:       'new-item',
  handler: function(action, container) {
    bootbox.prompt({
      title: "Enter a Graphite chart URL",
      backdrop: false,
      callback: function(result) {
        if (result) {
          let item = new_chart_from_graphite_url(result)
          if (item) {
            container.add(item)
            manager.current.dashboard.update_index()
            manager.update_item_view(container)
          }
        }
      }
    })
  }
})

/* -----------------------------------------------------------------------------
   New item handling
   ----------------------------------------------------------------------------- */

let new_item_actions = [].concat(actions.get('new-item-structural', 'row'),
                                 Action.DIVIDER,
                                 actions.list('new-item-display').sort(function(a, b) {
                                   return a.icon.localeCompare(b.icon)
                                 }),
                                 Action.DIVIDER,
                                 actions.list('new-item-data-table').sort(function(a, b) {
                                   return a.icon.localeCompare(b.icon)
                                 }),
                                 Action.DIVIDER,
                                 actions.list('new-item-chart').sort(function(a, b) {
                                   return a.icon.localeCompare(b.icon)
                                 })
                                )
let other = actions.list('new-item')
if (other && other.length) {
  new_item_actions.concat(other.sort(function(a, b) {
    return a.icon.localeCompare(b.icon)
  }))
}

let new_item_action_for_cell = new Action({
  name:      'new-item',
  category:  'new-item',
  css:       'ds-new-item',
  display:   'Add new dashboard item...',
  icon:      'fa fa-plus',
  actions:   new_item_actions
})

let new_item_action_for_section = new Action({
  name:      'new-item',
  category:  'new-item',
  css:       'ds-new-item',
  display:   'Add new dashboard item...',
  icon:      'fa fa-plus',
  actions: [].concat(actions.get('new-item-structural', 'section'),
                     actions.get('new-item-structural', 'row'),
                     Action.DIVIDER,
                     actions.list('new-item-display').sort(function(a, b) {
                       return a.icon.localeCompare(b.icon)
                     })
                    )
})

$(document).on('click', 'li.new-item', function(event) {
  log.debug('li.new-item.click')
  let elt      = $(this)
  let category = elt.attr('data-ds-category')
  let name     = elt.attr('data-ds-action')
  let item_id  = elt.parent().parent().parent().parent()[0].getAttribute('data-ds-item-id')
  let item     = manager.current.dashboard.get_item(item_id)
  let action   = actions.get(category, name)

  log.debug(`li.new-item:click(): ${item_id}, ${action}, ${category}/${name}`)

  action.handler(action, item)
  return false
})

/* -----------------------------------------------------------------------------
   Section actions
   ----------------------------------------------------------------------------- */

actions.register('edit-bar-section', [
  new_item_action_for_section,
  duplicate_item_action,
  Action.DIVIDER,
  move_back_action,
  move_forward_action,
  Action.DIVIDER,
  delete_action
])

/* -----------------------------------------------------------------------------
   Row actions
   ----------------------------------------------------------------------------- */

actions.register('edit-bar-row', [
  new Action({
    name: 'new-cell',
    display: 'Add new Cell',
    icon: 'fa fa-plus',
    handler: function(action, container) {
      container.add('cell')
    }
  }),
  duplicate_item_action,
  Action.DIVIDER,
  move_back_action,
  move_forward_action,
  Action.DIVIDER,
  delete_action
])

/* -----------------------------------------------------------------------------
   Cell actions
   ----------------------------------------------------------------------------- */

actions.register('edit-bar-cell', [
  new_item_action_for_cell,
  duplicate_item_action,
  Action.DIVIDER,
  move_back_action,
  move_forward_action,
  new Action({
    name:    'increase-span',
    display: 'Increase cell span by one',
    icon:    'fa fa-expand',
    handler:  function(action, item) {
      if (item.span) {
        item.span += 1
        manager.update_item_view(item)
      }
    }
  }),
  new Action({
    name:    'decrease-span',
    display: 'Decrease cell span by one',
    icon:    'fa fa-compress',
    handler:  function(action, item) {
      if (item.span) {
        item.span -= 1
        manager.update_item_view(item)
      }
    }
  }),
  Action.DIVIDER,
  delete_action
])

/* -----------------------------------------------------------------------------
   Item actions
   ----------------------------------------------------------------------------- */

actions.register('edit-bar-item', [
  duplicate_item_action,
  Action.DIVIDER,
  move_back_action,
  move_forward_action,
  view_definition_action,
  Action.DIVIDER,
  delete_action
])


/* -----------------------------------------------------------------------------
   Edit Bar Handler
   ----------------------------------------------------------------------------- */

$(document).on('click', '.ds-edit-bar button', function(event) {
  log.debug('click.ds-edit-bar button')
  let element  = $(this)[0]
  let parent   = $(this).parent()[0]
  let item_id  = parent.getAttribute('data-ds-item-id')
  let name     = element.getAttribute('data-ds-action')
  let category = element.getAttribute('data-ds-category')
  let action   = actions.get(category, name)
  let item     = manager.current.dashboard.get_item(item_id)

  if (action) {
    action.handler(action, item)
  }
})

/* -----------------------------------------------------------------------------
   Dashboard Query Panel
   ----------------------------------------------------------------------------- */

actions.register('dashboard-queries', [
  new Action({
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
  let action   = actions.get('dashboard-queries', name)

  if (action) {
    action.handler(action, manager.current.dashboard)
  }
})
