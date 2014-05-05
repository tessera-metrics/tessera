$(document).ready(function() {
  $('#ds-dashboard-tags').tagsManager({
    tagsContainer: '.ds-tag-holder',
    tagClass: 'badge badge-primary'
  });
});

$(document).on('click', '#ds-new-dashboard-create', function(e) {
  var title = $('#ds-dashboard-title')[0].value;
  var category = $('#ds-dashboard-category')[0].value;
  var summary = $('#ds-dashboard-summary')[0].value;
  var description = $('#ds-dashboard-description')[0].value;
  var tags = $('#ds-dashboard-tags').tagsManager('tags');

  var dashboard = ds.models.dashboard({
    title: title,
    category: category,
    summary: summary,
    description: description,
    tags: tags,
    definition: ds.models.dashboard_definition()
  });
  console.log(JSON.stringify(dashboard, null, '  '));
  ds.manager.create(dashboard, function(data) {
    window.location = data.view_href;
  });
});

$(document).on('click', '#ds-new-dashboard-cancel', function(e) {
    window.history.back();
});
