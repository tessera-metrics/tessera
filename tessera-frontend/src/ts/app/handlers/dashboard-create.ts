import Dashboard from '../../models/dashboard'
import manager from '../manager'
import { make } from '../../models/items/factory'

declare var $, window

/*
 * Logic for the dashboard-create.html template.
 */

$(document).ready(function() {
  let tags = $('#ds-dashboard-tags')
  if (tags.length) {
    tags .tagsManager({
      tagsContainer: '.ds-tag-holder',
      tagClass: 'badge badge-primary'
    })
  }
})

$(document).ready(function() {
  let form = $('#ds-dashboard-create-form')
  if (form.length) {
      form.bootstrapValidator()
  }
})

$(document).on('click', '#ds-new-dashboard-create', function(e) {
  let title = $('#ds-dashboard-title')[0].value
  let category = $('#ds-dashboard-category')[0].value
  let summary = $('#ds-dashboard-summary')[0].value
  let description = $('#ds-dashboard-description')[0].value
  let tags = $('#ds-dashboard-tags').tagsManager('tags')

  if (!$('#ds-dashboard-create-form').data('bootstrapValidator').validate().isValid()) {
    return
  }

  let dashboard = new Dashboard({
    title: title,
    category: category,
    summary: summary,
    description: description,
    tags: tags,
    definition: make('dashboard_definition')
  })
  manager.create(dashboard, function(rsp) {
    window.location = rsp.data.view_href
  })
})

$(document).on('click', '#ds-new-dashboard-cancel', function(e) {
    window.history.back()
})
