(function () {

  /* -----------------------------------------------------------------------------
     Queries
     ----------------------------------------------------------------------------- */

  /* Query delete buttons */
  $(document).on('click', 'button.ds-delete-query-button', function(e) {
    var $elt = $(this)
    var query_name   = $elt.attr('data-ds-query-name')
    var dashboard = ds.manager.current.dashboard
    if (!dashboard.definition.queries[query_name])
      return true
    var queries_in_use = dashboard.definition.get_queries()
    if (queries_in_use[query_name]) {
      bootbox.dialog({
        backdrop: false,
        message: 'Query ' + query_name + ' is in use. Are you sure you want to delete it?',
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
    var $elt       = $(this)
    var query_name = $elt.attr('data-ds-query-name')
    var dashboard  = ds.manager.current.dashboard
    if (!dashboard.definition.queries[query_name])
      return true
    duplicate_query(dashboard, query_name)
    return true
  })


  ds.edit.edit_queries = function() {
    /* Query names */
    $('th.ds-query-name').each(function(index, e) {
      var element = $(e)
      var query_name = e.getAttribute('data-ds-query-name')
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
      var element = $(e)
      var query_name = e.getAttribute('data-ds-query-name')
      element.editable({
        type: 'textarea',
        inputclass: 'ds-source',
        value: element.text() || '',
        success: function(ignore, newValue) {
          var target = newValue.trim()
          var query = ds.manager.current.dashboard.definition.queries[query_name]
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
    var query = dashboard.definition.queries[old_name]
    var updated_items = dashboard.definition.rename_query(old_name, new_name)
    $('[data-ds-query-name="' + old_name + '"]').replaceWith(
      ds.templates.edit['dashboard-query-row'](query)
    )
    if (updated_items && (updated_items.length > 0)) {
      for (var i = 0; i < updated_items.length; i++) {
        ds.manager.update_item_view(updated_items[i])
      }
    }
    ds.edit.edit_queries()
    ds.app.refresh_mode()
  }

  /**
   * Delete a query and remove it from the queries list in the UI.
   */
  function delete_query(dashboard, query_name) {
    dashboard.definition.delete_query(query_name)
    $('tr[data-ds-query-name="' + query_name + '"]').remove()
    ds.edit.edit_queries()
    ds.app.refresh_mode()
  }

  /**
   * Add a new query to the dashboard and UI.
   */
  function add_query(dashboard, name, target) {
    var query = ds.models.data.Query({name: name, targets: target})
    dashboard.definition.add_query(query)
    $("#ds-query-panel table").append(ds.templates.edit['dashboard-query-row'](query))
    query.load()
    ds.edit.edit_queries()
    return query
  }

  function duplicate_query(dashboard, name) {
    var new_name = 'Copy of ' + name + ' ' + Object.keys(dashboard.definition.queries).length
    var source   = dashboard.definition.queries[name]
    return add_query(dashboard, new_name, source.targets.slice(0))
  }

  /**
   * Add a new query object to the dashboard and UI with an
   * auto-generated unique name, and an optional set of targets. If
   * targets are not supplied, a function generating random data will
   * be used as a placeholder.
   */
  function new_query(dashboard, targets) {
    var name = "query" + Object.keys(dashboard.definition.queries).length
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
    var details = $('#' + item_id + '-details')
    details.remove()
    $('.ds-edit-bar[data-ds-item-id="' + item_id + '"] .btn-group').hide()
    $('.ds-edit-bar[data-ds-item-id="' + item_id + '"] .badge').removeClass('ds-badge-highlight')
  }

  ds.edit.show_details = function(item_id) {
    // Show the edit button bar across the top of the item
    $('.ds-edit-bar[data-ds-item-id="' + item_id + '"] .btn-group').show()
    var item = ds.manager.current.dashboard.get_item(item_id)
    var item_type = ds.models[item.item_type]
    var bar_id = '.ds-edit-bar[data-ds-item-id="' + item_id + '"]'
    var details_id = '#' + item_id + '-details'
    if ($(details_id).length == 0) {

      // Render the item's property sheet
      var elt = $('.ds-edit-bar[data-ds-item-id="' + item_id + '"]')
      var details = ds.templates['ds-edit-bar-item-details']({item:item})
      elt.append(details)

      if (item_type.interactive_properties) {
        // Run the edit handlers for each property, which make them
        // editable and set up the callbacks for their updates
        for (var i = 0; i < item_type.interactive_properties.length; i++) {
          item_type.interactive_properties[i].edit(item)
        }
      }
    }
  }

  ds.edit.toggle_details = function(item_id) {
    var details = $('#' + item_id + '-details')
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
    var $elt = $(this)
    var id   = $elt.attr('data-ds-item-id')
    if (ds.edit.toggle_details(id)) {
      $elt.addClass('ds-badge-highlight')
    } else {
      $elt.removeClass('ds-badge-highlight')
    }
  })

  $(document).on('mouseenter', '.ds-edit-bar', function(event) {
    var timeout_id = $(this).attr('data-ds-timeout-id')
    if (timeout_id) {
      window.clearTimeout(timeout_id)
    }
  })

  $(document).on('mouseleave', '.ds-edit-bar', function(event) {
    var $elt = $(this)
    var id   = $elt.attr('data-ds-item-id')
    var timeout = ds.config.PROPSHEET_AUTOCLOSE_SECONDS
    if (timeout && timeout > 0) {
      var timeout_id = window.setTimeout(function() {
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
      $('.ds-section, .ds-cell, .ds-row').addClass('ds-edit')
      ds.edit.edit_queries()
    },
    exit: function() {
      $('.ds-section, .ds-cell, .ds-row').removeClass('ds-edit')
    },
    refresh: function() {
      $('.ds-section, .ds-cell, .ds-row').addClass('ds-edit')
    }
  })

  /* -----------------------------------------------------------------------------
     Item Actions
     ----------------------------------------------------------------------------- */

  var duplicate_item_action = ds.action({
    name:    'duplicate',
    display: 'Duplicate Item',
    icon:    'fa fa-copy',
    handler: function(action, item) {
      var dashboard = ds.manager.current.dashboard
      var parent = dashboard.find_parent(item)
      var dup = ds.models.factory(item.toJSON()).set_item_id(null)
      dup.visit(function(child) {
        child.item_id = null
      })
      parent.add_after(item, dup)
      dashboard.update_index()
      ds.manager.update_item_view(parent)
    }
  })

  var delete_action = ds.action({
    name:    'delete',
    display: 'Delete item',
    icon:    'fa fa-trash-o',
    handler:  function(action, item) {
      var parent = ds.manager.current.dashboard.find_parent(item)
      if (!parent) {
        return
      }
      if (parent && parent.is_container && parent.remove(item)) {
        ds.manager.update_item_view(parent)
      }
    }
  })

  var move_back_action = ds.action({
    name:    'move-back',
    display: 'Move item back one place',
    icon:    'fa fa-caret-left',
    handler:  function(action, item) {
      var parent = ds.manager.current.dashboard.find_parent(item)
      if (parent.is_container && parent.move(item, -1)) {
        ds.manager.update_item_view(parent)
      }
    }
  })

  var move_forward_action = ds.action({
    name:    'move-forward',
    display: 'Move item forward one place',
    icon:    'fa fa-caret-right',
    handler:  function(action, item) {
      var parent = ds.manager.current.dashboard.find_parent(item)
      if (parent.is_container && parent.move(item, 1)) {
        ds.manager.update_item_view(parent)
      }
    }
  })

  var view_definition_action = ds.action({
    name:    'view-definition',
    display: 'View definition...',
    icon:    'fa fa-code',
    handler: function(action, item) {
      var contents = ds.templates.edit.item_source({item:item})
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
    var dash  = ds.manager.current.dashboard
    var url   = URI(url_string)
    var data  = url.search(true)
    var query = new_query(dash, data.target)
    var type  = 'standard_time_series'

    if (data.areaMode && data.areaMode === 'stacked') {
      type = 'stacked_area_chart'
    } else if (data.graphType && data.graphType === 'pie') {
      type = 'donut_chart'
    }

    var chart = ds.models.make(type)
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

  ds.actions.register('new-item-chart', {
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
            var item = new_chart_from_graphite_url(result)
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

  var new_item_actions = [].concat(ds.actions.get('new-item-structural', 'row'),
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
  var other = ds.actions.list('new-item')
  if (other && other.length) {
    new_item_actions.concat(other.sort(function(a, b) {
                              return a.icon.localeCompare(b.icon)
                            }))
  }

  var new_item_action_for_cell = ds.action({
    name: 'new-item',
    category: 'new-item',
    class: 'ds-new-item',
    display: 'Add new dashboard item...',
    icon: 'fa fa-plus',
    actions: new_item_actions
  })

  var new_item_action_for_section = ds.action({
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
    var elt = $(this)
    var category = elt.attr('data-ds-category')
    var name = elt.attr('data-ds-action')
    var item_id = elt.parent().parent().parent().parent()[0].getAttribute('data-ds-item-id')
    var item = ds.manager.current.dashboard.get_item(item_id)
    var action = ds.actions.get(category, name)

    action.handler(action, item)
    return false
  })

  /* -----------------------------------------------------------------------------
     Section actions
     ----------------------------------------------------------------------------- */

  ds.actions.register('edit-bar-section', [
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

  ds.actions.register('edit-bar-row', [
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

  ds.actions.register('edit-bar-cell', [
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

  ds.actions.register('edit-bar-item', [
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
    var element  = $(this)[0]
    var name     = element.getAttribute('data-ds-action')
    var action   = ds.actions.get('dashboard-queries', name)

    if (action) {
      action.handler(action, ds.manager.current.dashboard)
    }
  })

})()
