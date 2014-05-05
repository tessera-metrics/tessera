ds.manager.onDashboardListLoaded(function(data) {
  $(document).on('click', 'ul.ds-dashboard-action-menu li', function(event) {
    var action = this.getAttribute('data-ds-action');
    var href = $(event.target).parent().parent()[0].getAttribute('data-ds-href');
    switch (action) {
      case 'open':
        window.location = $(event.target).parent().parent()[0].getAttribute('data-ds-view-href');
      break;
      case 'duplicate':
        // TODO - should have dynamic refresh instead of setting window.location
        ds.manager.duplicate(href, function() {
          window.location.reload();
        });
        break;
      case 'delete':
        ds.manager.delete_with_confirmation(href, function() {
          window.location.reload();
        });
        break;
    }
  });
});
