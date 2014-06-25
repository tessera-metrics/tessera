(function () {

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
        for (var i in item_type.interactive_properties) {
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
          query.render_templates(ds.manager.location_context())
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
      for (var i in updated_items) {
        ds.manager.update_item_view(updated_items[i])
      }
    }
    ds.edit.edit_queries()
    ds.app.refresh_mode()
  }

  function delete_query(dashboard, query_name) {
    dashboard.definition.delete_query(query_name)
    $('tr[data-ds-query-name="' + query_name + '"]').remove()
    ds.edit.edit_queries()
    ds.app.refresh_mode()
  }

  function add_query(dashboard, name, target) {
    var query = ds.models.data.Query({name: name, targets: target})
    dashboard.definition.add_query(query)
    $("#ds-query-panel table").append(ds.templates.edit['dashboard-query-row'](query))
    query.load()
    ds.edit.edit_queries()
    return query
  }

  function new_query(dashboard, targets) {
    var name = "query" + Object.keys(dashboard.definition.queries).length
    return add_query(dashboard, name, targets || 'absolute(randomWalkFunction("' + name + '"))')
  }

  /**
   * Event handlers to show & hide the action bar & property sheet for
   * dashboard items.
   */

  var PROPERTY_SHEET_TIMEOUT = 3000

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
    var timeout_id = window.setTimeout(function() {
                       ds.edit.hide_details(id)
                     }, PROPERTY_SHEET_TIMEOUT)
    $elt.attr('data-ds-timeout-id', timeout_id)
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

  var item_properties_action = ds.action({
    name:    'properties',
    display: 'Properties',
    icon:    'fa fa-edit',
    handler: function(action, item) {
      ds.edit.toggle_details(item_id)
    }
  })

  var duplicate_item_action = ds.action({
    name:    'duplicate',
    display: 'Duplicate Item',
    icon:    'fa fa-copy',
    handler: function(action, item) {
      var dashboard = ds.manager.current.dashboard
      var parent = dashboard.find_parent(item)
      var dup = ds.models.factory(item.toJSON())
      dup.visit(function(child) {
        child.item_id = undefined
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
      bootbox.alert(contents)
    }
  })


  /* -----------------------------------------------------------------------------
     New from Graphite URL
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

  var new_from_url_action = ds.action({
    name: 'new-chart-from-url',
    display: 'Add new chart from Graphite URL',
    icon: 'fa fa-image',
    handler: function(action, container) {
      bootbox.prompt("Enter a Graphite chart URL", function(result) {
        if (result) {
          var item = new_chart_from_graphite_url(result)
          if (item) {
            container.add(item)
            ds.manager.current.dashboard.update_index()
            ds.manager.update_item_view(container)
          }
        }
      })
    }
  })

  /* -----------------------------------------------------------------------------
     New item handling
     ----------------------------------------------------------------------------- */

  function add_new_item(container, type) {
    container.add(ds.models.factory(type))
    ds.manager.current.dashboard.update_index()
    ds.manager.update_item_view(container)
  }

  var new_heading_action = ds.action({
    name: 'new-heading',
    display: 'Add new Heading',
    icon: 'fa fa-header',
    handler: function(action, container) {
      add_new_item(container, 'heading')
    }
  })

  var new_separator_action = ds.action({
    name: 'new-separator',
    display: 'Add new Separator',
    icon: 'fa fa-arrows-h',
    handler: function(action, container) {
      add_new_item(container, 'separator')
    }
  })

  var new_section_action = ds.action({
    name: 'new-section',
    display: 'Add new Section',
    handler: function(action, container) {
      add_new_item(container, 'section')
    }
  })

  var new_row_action = ds.action({
    name: 'new-row',
    display: 'Add new Row',
    handler: function(action, container) {
      add_new_item(container, 'row')
    }
  })

  var new_cell_action = ds.action({
    name: 'new-cell',
    display: 'Add new Cell',
    icon: 'fa fa-plus',
    handler: function(action, container) {
      add_new_item(container, 'cell')
    }
  })

  var new_markdown_action = ds.action({
    name: 'new-markdown',
    display: 'Add new Markdown',
    icon: 'fa fa-code',
    handler: function(action, container) {
      add_new_item(container, 'markdown')
    }
  })

  var new_singlestat_action = ds.action({
    name: 'new-singlestat',
    display: 'Add new Singlestat',
    handler: function(action, container) {
      add_new_item(container, 'singlestat')
    }
  })

  var new_jumbotron_singlestat_action = ds.action({
    name: 'new-jumbotron_singlestat',
    display: 'Add new Jumbotron Singlestat',
    handler: function(action, container) {
      add_new_item(container, 'jumbotron_singlestat')
    }
  })

  var new_summation_table_action = ds.action({
    name: 'new-summation_table',
    display: 'Add new Summation Table',
    icon: 'fa fa-table',
    handler: function(action, container) {
      add_new_item(container, 'summation_table')
    }
  })

  var new_timeshift_summation_table_action = ds.action({
    name: 'new-timeshift-summation_table',
    display: 'Add new Timeshift Summation Table',
    icon: 'fa fa-table',
    handler: function(action, container) {
      add_new_item(container, 'timeshift_summation_table')
    }
  })

  var new_simple_time_series_action = ds.action({
    name: 'new-simple_time_series',
    display: 'Add new Simple Time Series',
    icon: 'fa fa-image',
    handler: function(action, container) {
      add_new_item(container, 'simple_time_series')
    }
  })

  var new_standard_time_series_action = ds.action({
    name: 'new-standard_time_series',
    display: 'Add new Standard Time Series',
    icon: 'fa fa-image',
    handler: function(action, container) {
      add_new_item(container, 'standard_time_series')
    }
  })

  var new_stacked_area_chart_action = ds.action({
    name: 'new-stacked_area_chart',
    display: 'Add new Stacked Area Chart',
    icon: 'fa fa-image',
    handler: function(action, container) {
      add_new_item(container, 'stacked_area_chart')
    }
  })

  var new_donut_chart_action = ds.action({
    name: 'new-donut_area_chart',
    display: 'Add new Donut Chart',
    icon: 'fa fa-image',
    handler: function(action, container) {
      add_new_item(container, 'donut_chart')
    }
  })


  var new_singlegraph_action = ds.action({
    name: 'new-singlegraph',
    display: 'Add new Singlegraph',
    icon: 'fa fa-image',
    handler: function(action, container) {
      add_new_item(container, 'singlegraph')
    }
  })

  var all_new_item_actions = [
    new_section_action,
    new_row_action,
    new_cell_action,
    ds.action.divider,
    new_markdown_action,
    new_heading_action,
    new_separator_action,
    ds.action.divider,
    new_singlestat_action,
    new_jumbotron_singlestat_action,
    new_summation_table_action,
    new_timeshift_summation_table_action,
    ds.action.divider,
    new_from_url_action,
    new_simple_time_series_action,
    new_standard_time_series_action,
    new_stacked_area_chart_action,
    new_donut_chart_action,
    new_singlegraph_action
  ].map(function(action) { return action.set_class('new-item').set_category('new-item') })

  ds.actions.register('new-item',
                      all_new_item_actions.filter(function(action) {
                        return !action.divider
                      }))

  var new_item_action_for_cell = ds.action({
    name: 'new-item',
    category: 'new-item',
    class: 'ds-new-item',
    display: 'Add new dashboard item...',
    icon: 'fa fa-plus',
    actions: all_new_item_actions.filter(function(action) {
               return action != new_section_action && action != new_cell_action
             })
  })

  var new_item_action_for_section = ds.action({
    name: 'new-item',
    category: 'new-item',
    class: 'ds-new-item',
    display: 'Add new dashboard item...',
    icon: 'fa fa-plus',
    actions: [
      new_section_action,
      new_row_action,
      ds.action.divider,
      new_heading_action,
      new_separator_action,
      new_markdown_action
    ]
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
        add_new_item(container, 'cell')
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
