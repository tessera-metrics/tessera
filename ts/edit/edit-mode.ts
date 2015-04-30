(function () {

  let log = ts.log.logger('tessera.edit')

  /* -----------------------------------------------------------------------------
     Queries
     ----------------------------------------------------------------------------- */

  /* Query delete buttons */
  $(document).on('click', 'button.ds-delete-query-button', function(e) {
    log.debug('click.delete-query')
    let $elt       = $(this)
    let query_name = $elt.attr('data-ds-query-name')
    let dashboard  = ds.manager.current.dashboard
    if (!dashboard.definition.queries[query_name])
      return true
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
    let dashboard  = ds.manager.current.dashboard
    if (!dashboard.definition.queries[query_name])
      return true
    duplicate_query(dashboard, query_name)
    return true
  })

  $(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function(e) {
    log.debug('shown.bs.tab ' + e.target.href)
    if (e.target.id == 'ds-edit-tab-queries') {
      ds.edit.edit_queries()
    }
  })

  ds.edit.edit_queries = function() {
    log.debug('edit_queries()')
    /* Query names */
    $('th.ds-query-name').each(function(index, e) {
      let element    = $(e)
      let query_name = e.getAttribute('data-ds-query-name')
      element.editable({
        type: 'text',
        value: query_name,
        success: function(ignore, newValue) {
          rename_query(ds.manager.current.dashboard, query_name, newValue)
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
          let query = ds.manager.current.dashboard.definition.queries[query_name]
          query.targets = [target]
          query.render_templates(ds.context().variables)
          query.load()
        }
      })
    });
  }

  /**
   * Rename a query and update the UI to reflect the change.
   */
  function rename_query(dashboard, old_name, new_name) {
    log.debug('rename_query()')
    let query         = dashboard.definition.queries[old_name]
    let updated_items = dashboard.definition.rename_query(old_name, new_name)
    $('[data-ds-query-name="' + old_name + '"]').replaceWith(
      ds.templates.edit['dashboard-query-row'](query)
    )
    if (updated_items && updated_items.length) {
      for (let item of updated_items) {
        ds.manager.update_item_view(item)
      }
    }
    ds.edit.edit_queries()
    ds.app.refresh_mode()
  }

  /**
   * Delete a query and remove it from the queries list in the UI.
   */
  function delete_query(dashboard, query_name) {
    log.debug('delete_query()')
    dashboard.definition.delete_query(query_name)
    $('tr[data-ds-query-name="' + query_name + '"]').remove()
    ds.edit.edit_queries()
    ds.app.refresh_mode()
  }

  /**
   * Add a new query to the dashboard and UI.
   */
  function add_query(dashboard, name, target?) {
    log.debug('add_query()')
    let query = new ts.models.data.Query({name: name, targets: target})
    dashboard.definition.add_query(query)
    $("#ds-query-panel table").append(ds.templates.edit['dashboard-query-row'](query))
    query.load()
    ds.edit.edit_queries()
    return query
  }

  function duplicate_query(dashboard, name) {
    log.debug('duplicate_query()')
    let new_name = 'Copy of ' + name + ' ' + Object.keys(dashboard.definition.queries).length
    let source   = dashboard.definition.queries[name]
    return add_query(dashboard, new_name, source.targets.slice(0))
  }

  /**
   * Add a new query object to the dashboard and UI with an
   * auto-generated unique name, and an optional set of targets. If
   * targets are not supplied, a function generating random data will
   * be used as a placeholder.
   */
  function new_query(dashboard, targets?) {
    log.debug('new_query()')
    let name = "query" + Object.keys(dashboard.definition.queries).length
    return add_query(dashboard, name, targets || 'absolute(randomWalkFunction("' + name + '"))')
  }

  /* -----------------------------------------------------------------------------
     Property Sheets
     ----------------------------------------------------------------------------- */

  /**
   * Helper functions to show & hide the action bar & property sheet
   * for dashboard items.
   */
  ds.edit.hide_details = function(item_id) {
    let details = $('#' + item_id + '-details')
    details.remove()
    $('.ds-edit-bar[data-ds-item-id="' + item_id + '"] .btn-group').hide()
    $('.ds-edit-bar[data-ds-item-id="' + item_id + '"] .badge').removeClass('ds-badge-highlight')
  }

  ds.edit.show_details = function(item_id) {
    // Show the edit button bar across the top of the item
    $('.ds-edit-bar[data-ds-item-id="' + item_id + '"] .btn-group').show()
    let item       = ds.manager.current.dashboard.get_item(item_id)
    let item_type  = ds.models[item.item_type]
    let bar_id     = '.ds-edit-bar[data-ds-item-id="' + item_id + '"]'
    let details_id = '#' + item_id + '-details'
    if ($(details_id).length == 0) {

      // Render the item's property sheet
      let elt     = $('.ds-edit-bar[data-ds-item-id="' + item_id + '"]')
      let details = ds.templates['ds-edit-bar-item-details']({item:item})
      elt.append(details)

      if (item_type.interactive_properties) {
        // Run the edit handlers for each property, which make them
        // editable and set up the callbacks for their updates
        for (let prop of item_type.interactive_properties) {
          prop.edit(item)
        }
      }
    }
  }

  ds.edit.toggle_details = function(item_id) {
    let details = $('#' + item_id + '-details')
    if (details.is(':visible')) {
      ds.edit.hide_details(item_id)
      return false
    } else {
      ds.edit.show_details(item_id)
      return true
    }
  }

  ds.edit.details_visibility = function(item) {
    return $('#' + item.item_id + '-details').is(':visible')
  }

  /**
   * Event handlers to show & hide the action bar & property sheet for
   * dashboard items.
   */

  $(document).on('click', '.ds-edit-bar .badge', function(event) {
    let $elt = $(this)
    let id   = $elt.attr('data-ds-item-id')
    if (ds.edit.toggle_details(id)) {
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
    let timeout = ds.config.PROPSHEET_AUTOCLOSE_SECONDS
    if (timeout) {
      let timeout_id = window.setTimeout(function() {
                         ds.edit.hide_details(id)
                       }, timeout * 1000)
      $elt.attr('data-ds-timeout-id', timeout_id)
    }
  })

  /**
   * Toggle mode-specific CSS rules for dashboard structural elements.
   */

  ds.app.add_mode_handler(ds.app.Mode.EDIT, {
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

  let duplicate_item_action = ds.action({
    name:    'duplicate',
    display: 'Duplicate Item',
    icon:    'fa fa-copy',
    handler: function(action, item) {
      let dashboard = ds.manager.current.dashboard
      let parent = dashboard.find_parent(item)
      let dup = ds.models.factory(item.toJSON()).set_item_id(null)
      dup.visit(function(child) {
        child.item_id = null
      })
      parent.add_after(item, dup)
      dashboard.update_index()
      ds.manager.update_item_view(parent)
    }
  })

  let delete_action = ds.action({
    name:    'delete',
    display: 'Delete item',
    icon:    'fa fa-trash-o',
    handler:  function(action, item) {
      let parent = ds.manager.current.dashboard.find_parent(item)
      if (!parent) {
        return
      }
      if (parent && parent.is_container && parent.remove(item)) {
        ds.manager.update_item_view(parent)
      }
    }
  })

  let move_back_action = ds.action({
    name:    'move-back',
    display: 'Move item back one place',
    icon:    'fa fa-caret-left',
    handler:  function(action, item) {
      let parent = ds.manager.current.dashboard.find_parent(item)
      if (parent.is_container && parent.move(item, -1)) {
        ds.manager.update_item_view(parent)
      }
    }
  })

  let move_forward_action = ds.action({
    name:    'move-forward',
    display: 'Move item forward one place',
    icon:    'fa fa-caret-right',
    handler:  function(action, item) {
      let parent = ds.manager.current.dashboard.find_parent(item)
      if (parent.is_container && parent.move(item, 1)) {
        ds.manager.update_item_view(parent)
      }
    }
  })

  let view_definition_action = ds.action({
    name:    'view-definition',
    display: 'View definition...',
    icon:    'fa fa-code',
    handler: function(action, item) {
      let contents = ds.templates.edit.item_source({item:item})
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
    let dash  = ds.manager.current.dashboard
    let url   = new URI(url_string)
    let data  = url.search(true)
    let query = new_query(dash, data.target)
    let type  = 'standard_time_series'

    if (data.areaMode && data.areaMode === 'stacked') {
      type = 'stacked_area_chart'
    } else if (data.graphType && data.graphType === 'pie') {
      type = 'donut_chart'
    }

    let chart = ds.models.make(type)
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

  ts.actions.register('new-item-chart', {
    name: 'new-chart-from-url',
    display: 'Add new chart from Graphite URL',
    icon: 'fa fa-image',
    class: 'new-item',
    category: 'new-item-chart',
    handler: function(action, container) {
      bootbox.prompt({
        title: "Enter a Graphite chart URL",
        backdrop: false,
        callback: function(result) {
          if (result) {
            let item = new_chart_from_graphite_url(result)
            if (item) {
              container.add(item)
              ds.manager.current.dashboard.update_index()
              ds.manager.update_item_view(container)
            }
          }
        }
      })
    }
  })

  /* -----------------------------------------------------------------------------
     New item handling
     ----------------------------------------------------------------------------- */

  let new_item_actions = [].concat(ds.actions.get('new-item-structural', 'row'),
                                   ds.action.divider,
                                   ds.actions.list('new-item-display').sort(function(a, b) {
                                     return a.icon.localeCompare(b.icon)
                                   }),
                                   ds.action.divider,
                                   ds.actions.list('new-item-data-table').sort(function(a, b) {
                                     return a.icon.localeCompare(b.icon)
                                   }),
                                   ds.action.divider,
                                   ds.actions.list('new-item-chart').sort(function(a, b) {
                                     return a.icon.localeCompare(b.icon)
                                   })
                                  )
  let other = ds.actions.list('new-item')
  if (other && other.length) {
    new_item_actions.concat(other.sort(function(a, b) {
                              return a.icon.localeCompare(b.icon)
                            }))
  }

  let new_item_action_for_cell = ds.action({
    name: 'new-item',
    category: 'new-item',
    class: 'ds-new-item',
    display: 'Add new dashboard item...',
    icon: 'fa fa-plus',
    actions: new_item_actions
  })

  let new_item_action_for_section = ds.action({
    name: 'new-item',
    category: 'new-item',
    class: 'ds-new-item',
    display: 'Add new dashboard item...',
    icon: 'fa fa-plus',
    actions: [].concat(ds.actions.get('new-item-structural', 'section'),
                       ds.actions.get('new-item-structural', 'row'),
                       ds.action.divider,
                       ds.actions.list('new-item-display').sort(function(a, b) {
                         return a.icon.localeCompare(b.icon)
                       })
                      )
  })

  $(document).on('click', 'li.new-item', function(event) {
    let elt      = $(this)
    let category = elt.attr('data-ds-category')
    let name     = elt.attr('data-ds-action')
    let item_id  = elt.parent().parent().parent().parent()[0].getAttribute('data-ds-item-id')
    let item     = ds.manager.current.dashboard.get_item(item_id)
    let action   = ds.actions.get(category, name)

    action.handler(action, item)
    return false
  })

  /* -----------------------------------------------------------------------------
     Section actions
     ----------------------------------------------------------------------------- */

  ts.actions.register('edit-bar-section', [
    new_item_action_for_section,
    duplicate_item_action,
    ds.action.divider,
    move_back_action,
    move_forward_action,
    ds.action.divider,
    delete_action
  ])

  /* -----------------------------------------------------------------------------
     Row actions
     ----------------------------------------------------------------------------- */

  ts.actions.register('edit-bar-row', [
    ds.action({
      name: 'new-cell',
      display: 'Add new Cell',
      icon: 'fa fa-plus',
      handler: function(action, container) {
        container.add('cell')
      }
    }),
    duplicate_item_action,
    ds.action.divider,
    move_back_action,
    move_forward_action,
    ds.action.divider,
    delete_action
  ])

  /* -----------------------------------------------------------------------------
     Cell actions
     ----------------------------------------------------------------------------- */

  ts.actions.register('edit-bar-cell', [
    new_item_action_for_cell,
    duplicate_item_action,
    ds.action.divider,
    move_back_action,
    move_forward_action,
    ds.action({
      name:    'increase-span',
      display: 'Increase cell span by one',
      icon:    'fa fa-expand',
      handler:  function(action, item) {
        if (item.span) {
          item.span += 1
          ds.manager.update_item_view(item)
        }
      }
    }),
    ds.action({
      name:    'decrease-span',
      display: 'Decrease cell span by one',
      icon:    'fa fa-compress',
      handler:  function(action, item) {
        if (item.span) {
          item.span -= 1
          ds.manager.update_item_view(item)
        }
      }
    }),
    ds.action.divider,
    delete_action
  ])

  /* -----------------------------------------------------------------------------
     Item actions
     ----------------------------------------------------------------------------- */

  ts.actions.register('edit-bar-item', [
    duplicate_item_action,
    ds.action.divider,
    move_back_action,
    move_forward_action,
    view_definition_action,
    ds.action.divider,
    delete_action
  ])


  /* -----------------------------------------------------------------------------
     Edit Bar Handler
     ----------------------------------------------------------------------------- */

  $(document).on('click', '.ds-edit-bar button', function(event) {
    let element  = $(this)[0]
    let parent   = $(this).parent()[0]
    let item_id  = parent.getAttribute('data-ds-item-id')
    let name     = element.getAttribute('data-ds-action')
    let category = element.getAttribute('data-ds-category')
    let action   = ds.actions.get(category, name)
    let item     = ds.manager.current.dashboard.get_item(item_id)

    if (action) {
      action.handler(action, item)
    }
  })

  /* -----------------------------------------------------------------------------
     Dashboard Query Panel
     ----------------------------------------------------------------------------- */

  ds.actions.register('dashboard-queries', [
    ds.action({
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
    let action   = ds.actions.get('dashboard-queries', name)

    if (action) {
      action.handler(action, ds.manager.current.dashboard)
    }
  })

})()
