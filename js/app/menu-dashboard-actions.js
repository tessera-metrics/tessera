cronenberg.dashboards.onDashboardListLoaded(function(data) {
  $('ul.ds-dashboard-action-menu li').click(function(event) {
    var action = this.getAttribute('data-ds-action');
    var href = $(event.target).parent().parent()[0].getAttribute('data-ds-href');
    switch (action) {
      case 'open':
        window.location = $(event.target).parent().parent()[0].getAttribute('data-ds-view-href');
      break;
      case 'duplicate':
        // TODO - should have dynamic refresh instead of setting window.location
        cronenberg.dashboards.duplicate(href, function() {
          window.location.reload();
        });
        break;
      case 'delete':
        cronenberg.dashboards.delete_with_confirmation(href, function() {
          window.location.reload();
        });
        break;
    }
  });
});
