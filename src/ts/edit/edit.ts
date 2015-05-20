import * as core from '../core'
import * as app from '../app/app'
import manager from '../app/manager'
import Axis from '../models/axis'
import Query from '../models/data/query'
import Container from '../models/items/container'
import { make } from '../models/items/factory'

import * as queries from './queries'

import * as props   from './property-sheets'
export * from './property-sheets'

declare var $, bootbox, ts
const log = core.logger('edit')


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

let duplicate_item_action = new core.Action({
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

let delete_action = new core.Action({
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

let move_back_action = new core.Action({
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

let move_forward_action = new core.Action({
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

let view_definition_action = new core.Action({
  name:    'view-definition',
  display: 'View definition...',
  icon:    'fa fa-code',
  handler: function(action, item) {
    let contents = ts.templates.edit.item_source({item:item})
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
  let query = queries.new_query(dash, data.target)
  let type  = 'standard_time_series'

  if (data.areaMode && data.areaMode === 'stacked') {
    type = 'stacked_area_chart'
  } else if (data.graphType && data.graphType === 'pie') {
    type = 'donut_chart'
  }

  let chart = make(type)
    .set_dashboard(dash)
    .set_query(query.name)
    .set_height(Math.min(8, Math.floor(((data.height || 400) / 80))))
    .set_title(data.title)

  chart.options = chart.options || {}

  if (data.vtitle) {
    if (!chart.options.y1)
      chart.options.y1 = new Axis()
    chart.options.y1.label = data.vtitle
  }

  if (data.yMin) {
    if (!chart.options.y1)
      chart.options.y1 = new Axis()
    chart.options.y1.min = data.yMin
  }

  if (data.yMax) {
    if (!chart.options.y1)
      chart.options.y1 = new Axis()
    chart.options.y1.max = data.yMax
  }

  if (data.template) {
    chart.options.palette = data.template
  }

  return chart
}

core.actions.register({
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
          }
        }
      }
    })
  }
})

/* -----------------------------------------------------------------------------
   New item handling
   ----------------------------------------------------------------------------- */

function new_item_actions() : core.ActionList {
  let list = [].concat(core.actions.get('new-item-structural', 'row'),
                       core.Action.DIVIDER,
                       core.actions.list('new-item-display').sort(function(a, b) {
                         return a.icon.localeCompare(b.icon)
                       }),
                       core.Action.DIVIDER,
                       core.actions.list('new-item-data-table').sort(function(a, b) {
                         return a.icon.localeCompare(b.icon)
                       }),
                       core.Action.DIVIDER,
                       core.actions.list('new-item-chart').sort(function(a, b) {
                         return a.icon.localeCompare(b.icon)
                       })
                      )
  let other = core.actions.list('new-item')
  if (other && other.length) {
    list.concat(other.sort(function(a, b) {
      return a.icon.localeCompare(b.icon)
    }))
  }
  return list
}

let new_item_action_for_cell = new core.Action({
  name:      'new-item',
  category:  'new-item',
  css:       'ds-new-item',
  display:   'Add new dashboard item...',
  icon:      'fa fa-plus',
  actions:   new_item_actions
})

let new_item_action_for_section = new core.Action({
  name:      'new-item',
  category:  'new-item',
  css:       'ds-new-item',
  display:   'Add new dashboard item...',
  icon:      'fa fa-plus',
  actions: () : core.ActionList => {
    return [].concat(core.actions.get('new-item-structural', 'section'),
                     core.actions.get('new-item-structural', 'row'),
                     core.Action.DIVIDER,
                     core.actions.list('new-item-display').sort(function(a, b) {
                       return a.icon.localeCompare(b.icon)
                     })
                    )
  }
})

$(document).on('click', 'li.new-item', function(event) {
  log.debug('li.new-item.click')
  let elt      = $(this)
  let category = elt.attr('data-ds-category')
  let name     = elt.attr('data-ds-action')
  let item_id  = elt.parent().parent().parent().parent()[0].getAttribute('data-ds-item-id')
  let item     = manager.current.dashboard.get_item(item_id)
  let action   = core.actions.get(category, name)

  log.debug(`li.new-item:click(): ${item_id}, ${action}, ${category}/${name}`)

  action.handler(action, item)
  return false
})

/* -----------------------------------------------------------------------------
   Section actions
   ----------------------------------------------------------------------------- */

core.actions.register('edit-bar-section', [
  new_item_action_for_section,
  duplicate_item_action,
  core.Action.DIVIDER,
  move_back_action,
  move_forward_action,
  core.Action.DIVIDER,
  delete_action
])

/* -----------------------------------------------------------------------------
   Row actions
   ----------------------------------------------------------------------------- */

core.actions.register('edit-bar-row', [
  new core.Action({
    name: 'new-cell',
    display: 'Add new Cell',
    icon: 'fa fa-plus',
    handler: function(action, container) {
      container.add('cell')
    }
  }),
  duplicate_item_action,
  core.Action.DIVIDER,
  move_back_action,
  move_forward_action,
  core.Action.DIVIDER,
  delete_action
])

/* -----------------------------------------------------------------------------
   Cell actions
   ----------------------------------------------------------------------------- */

core.actions.register('edit-bar-cell', [
  new_item_action_for_cell,
  duplicate_item_action,
  core.Action.DIVIDER,
  move_back_action,
  move_forward_action,
  new core.Action({
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
  new core.Action({
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
  core.Action.DIVIDER,
  delete_action
])

/* -----------------------------------------------------------------------------
   Item actions
   ----------------------------------------------------------------------------- */

core.actions.register('edit-bar-item', [
  duplicate_item_action,
  core.Action.DIVIDER,
  move_back_action,
  move_forward_action,
  view_definition_action,
  core.Action.DIVIDER,
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
  let action   = core.actions.get(category, name)
  let item     = manager.current.dashboard.get_item(item_id)

  if (action) {
    action.handler(action, item)
  }
})
