import * as core from '../core'
import manager from '../app/manager'
import * as app from '../app/app'

declare var $, ts
const log = core.logger('edit')

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
    let details = ts.templates['ds-edit-bar-item-details']({item:item})
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
   Property Sheets Event Handlers
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
