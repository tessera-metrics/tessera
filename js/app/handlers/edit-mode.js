(function () {

  /**
   * Helper functions to show & hide the action bar & property sheet
   * for dashboard items.
   */

  function toggle_details(item_id) {
    var details = $('#' + item_id + '-details')
    if (details.is(':visible')) {
      hide_details(item_id)
    } else {
      show_details(item_id)
    }
  }

  function hide_details(item_id) {
    var details = $('#' + item_id + '-details')
    details.fadeOut()
  }

  function show_details(item_id) {
    var details = $('#' + item_id + '-details')
    details.fadeIn()
    var item = ds.manager.current.dashboard.get_item(item_id)
    if (item.interactive_properties) {
      var props = item.interactive_properties()
      for (var i in props) {
        var prop = props[i]
          var ns = ds.templates.edit.properties
        if (prop && ns[prop.name] && ns[prop.name].editHandler) {
          ns[prop.name].editHandler(prop, item)
        }
      }
    }
  }

  /**
   * Event handlers to show & hide the action bar & property sheet for
   * dashboard items.
   */

  $(document).on('mouseenter', '.ds-edit-bar .badge', function(event) {
    $(this).addClass('ds-badge-highlight')
    var id = $(this).attr('data-ds-item-id')
    $('.ds-edit-bar[data-ds-item-id="' + id + '"] .btn-group').fadeIn()
    show_details(id)
  })

  $(document).on('mouseleave', '.ds-edit-bar', function(event) {
    var id = $(this).attr('data-ds-item-id')
    $('.ds-edit-bar[data-ds-item-id="' + id + '"] .btn-group').fadeOut()
    $('.ds-edit-bar[data-ds-item-id="' + id + '"] .badge').removeClass('ds-badge-highlight')
    hide_details(id)
  })

  /**
   * Toggle mode-specific CSS rules for dashboard structural elements.
   */

  ds.app.add_mode_handler(ds.app.Mode.EDIT, {
    enter: function() {
      $('.ds-section, .ds-cell, .ds-row').addClass('ds-edit')
    },
    exit: function() {
      $('.ds-section, .ds-cell, .ds-row').removeClass('ds-edit')
    },
    refresh: function() {
      $('.ds-section, .ds-cell, .ds-row').addClass('ds-edit')
    }
  })

  var item_properties_action = ds.models.action({
    name:    'properties',
    display: 'Properties',
    icon:    'fa fa-edit',
    handler: function(action, item) {
      toggle_details(item_id)
    }
  })

  var duplicate_item_action = ds.models.action({
    name:    'duplicate',
    display: 'Duplicate Item',
    icon:    'fa fa-copy',
    handler: function(action, item) {
      var dashboard = ds.manager.current.dashboard
      var parent = dashboard.find_parent(item)
      var dup = ds.models.factory(item.toJSON())
      dup.visit(function(item) {
        item.item_id = undefined
      })
      parent.add(dup) /** TODO: adding immediately after the source item would be nice */
      dashboard.update_index()
      ds.manager.update_item_view(parent)
    }
  })

  var delete_action = ds.models.action({
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

  var move_back_action = ds.models.action({
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

  var move_forward_action = ds.models.action({
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

  var view_definition_action = ds.models.action({
    name:    'view-definition',
    display: 'View definition...',
    icon:    'fa fa-code',
    handler: function(action, item) {
      var contents = ds.templates.edit.item_source({item:item})
      bootbox.alert(contents)
    }
  })

  /* -----------------------------------------------------------------------------
     New item handling
     ----------------------------------------------------------------------------- */

  function add_new_item(container, type) {
    container.add(ds.models[type]())
    ds.manager.current.dashboard.update_index()
    ds.manager.update_item_view(container)
  }

  var new_heading_action = ds.models.action({
    name: 'new-heading',
    display: 'Add new Heading',
    icon: 'fa fa-header',
    handler: function(action, container) {
      add_new_item(container, 'heading')
    }
  })

  var new_separator_action = ds.models.action({
    name: 'new-separator',
    display: 'Add new Separator',
    icon: 'fa fa-arrows-h',
    handler: function(action, container) {
      add_new_item(container, 'separator')
    }
  })

  var new_section_action = ds.models.action({
    name: 'new-section',
    display: 'Add new Section',
    handler: function(action, container) {
      add_new_item(container, 'section')
    }
  })

  var new_row_action = ds.models.action({
    name: 'new-row',
    display: 'Add new Row',
    handler: function(action, container) {
      add_new_item(container, 'row')
    }
  })

  var new_cell_action = ds.models.action({
    name: 'new-cell',
    display: 'Add new Cell',
    icon: 'fa fa-plus',
    handler: function(action, container) {
      add_new_item(container, 'cell')
    }
  })

  var new_markdown_action = ds.models.action({
    name: 'new-markdown',
    display: 'Add new Markdown',
    icon: 'fa fa-code',
    handler: function(action, container) {
      add_new_item(container, 'markdown')
    }
  })

  var new_singlestat_action = ds.models.action({
    name: 'new-singlestat',
    display: 'Add new Singlestat',
    handler: function(action, container) {
      add_new_item(container, 'singlestat')
    }
  })

  var new_jumbotron_singlestat_action = ds.models.action({
    name: 'new-jumbotron_singlestat',
    display: 'Add new Jumbotron Singlestat',
    handler: function(action, container) {
      add_new_item(container, 'jumbotron_singlestat')
    }
  })

  var new_summation_table_action = ds.models.action({
    name: 'new-summation_table',
    display: 'Add new Summation Table',
    icon: 'fa fa-table',
    handler: function(action, container) {
      add_new_item(container, 'summation_table')
    }
  })

  var new_simple_time_series_action = ds.models.action({
    name: 'new-simple_time_series',
    display: 'Add new Simple Time Series',
    icon: 'fa fa-image',
    handler: function(action, container) {
      add_new_item(container, 'simple_time_series')
    }
  })

  var new_standard_time_series_action = ds.models.action({
    name: 'new-standard_time_series',
    display: 'Add new Standard Time Series',
    icon: 'fa fa-image',
    handler: function(action, container) {
      add_new_item(container, 'standard_time_series')
    }
  })

  var new_stacked_area_chart_action = ds.models.action({
    name: 'new-stacked_area_chart',
    display: 'Add new Stacked Area Chart',
    icon: 'fa fa-image',
    handler: function(action, container) {
      add_new_item(container, 'stacked_area_chart')
    }
  })

  var new_singlegraph_action = ds.models.action({
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
    ds.models.action.divider,
    new_markdown_action,
    new_heading_action,
    new_separator_action,
    ds.models.action.divider,
    new_singlestat_action,
    new_jumbotron_singlestat_action,
    new_summation_table_action,
    ds.models.action.divider,
    new_simple_time_series_action,
    new_standard_time_series_action,
    new_stacked_area_chart_action,
    new_singlegraph_action
  ].map(function(action) { return action.set_class('new-item').set_category('new-item') })

  ds.actions.register('new-item',
                      all_new_item_actions.filter(function(action) {
                        return !action.divider
                      }))

  var new_item_action_for_cell = ds.models.action({
    name: 'new-item',
    category: 'new-item',
    class: 'ds-new-item',
    display: 'Add new dashboard item...',
    icon: 'fa fa-plus',
    actions: all_new_item_actions.filter(function(action) {
               return action != new_section_action && action != new_cell_action
             })
  })

  var new_item_action_for_section = ds.models.action({
    name: 'new-item',
    category: 'new-item',
    class: 'ds-new-item',
    display: 'Add new dashboard item...',
    icon: 'fa fa-plus',
    actions: [
      new_section_action,
      new_row_action,
      ds.models.action.divider,
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
    ds.models.action.divider,
    move_back_action,
    move_forward_action,
    ds.models.action.divider,
    delete_action
  ])

  /* -----------------------------------------------------------------------------
     Row actions
     ----------------------------------------------------------------------------- */

  ds.actions.register('edit-bar-row', [
    ds.models.action({
      name: 'new-cell',
      display: 'Add new Cell',
      icon: 'fa fa-plus',
      handler: function(action, container) {
        add_new_item(container, 'cell')
      }
    }),
    duplicate_item_action,
    ds.models.action.divider,
    move_back_action,
    move_forward_action,
    ds.models.action.divider,
    delete_action
  ])

  /* -----------------------------------------------------------------------------
     Cell actions
     ----------------------------------------------------------------------------- */

  ds.actions.register('edit-bar-cell', [
    new_item_action_for_cell,
    duplicate_item_action,
    ds.models.action.divider,
    move_back_action,
    move_forward_action,
    ds.models.action({
      name:    'increase-span',
      display: 'Increase cell span by one',
      icon:    'fa fa-expand',
      handler:  function(action, item) {
        if (item.span) {
          item.span += 1
          ds.manager.update_item_view(ds.manager.current.dashboard.find_parent(item))
        }
      }
    }),
    ds.models.action({
      name:    'decrease-span',
      display: 'Decrease cell span by one',
      icon:    'fa fa-compress',
      handler:  function(action, item) {
        if (item.span) {
          item.span -= 1
          ds.manager.update_item_view(ds.manager.current.dashboard.find_parent(item))
        }
      }
    }),
    ds.models.action.divider,
    delete_action
  ])

  /* -----------------------------------------------------------------------------
     Item actions
     ----------------------------------------------------------------------------- */

  ds.actions.register('edit-bar-item', [
    duplicate_item_action,
    ds.models.action.divider,
    move_back_action,
    move_forward_action,
    view_definition_action,
    ds.models.action.divider,
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
    ds.models.action({
      name:    'new-query',
      display: 'New Query...',
      icon:    'fa fa-plus',
      handler:  function(action) {

      }
    })
  ])


  /**
   * Rename a query and update the UI to reflect the change.
   */
  function rename_query(old_name, new_name) {
    var query = ds.manager.current.dashboard.definition.queries[old_name]
    var updated_items = ds.manager.current.dashboard.definition.rename_query(old_name, new_name)
    $('[data-ds-query-name="' + old_name + '"]').replaceWith(
      ds.templates.edit['dashboard-query-row'](query)
    )
    if (updated_items && (updated_items.length > 0)) {
      for (var i in updated_items) {
        ds.manager.update_item_view(updated_items[i])
      }
    }
    ds.app.refresh_mode()
  }

})()
