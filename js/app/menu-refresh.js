cronenberg.dashboards.onDashboardLoaded(function(d) {
  $("button.ds-refresh-button").click(function(e) {
    cronenberg.dashboards.refresh();
  });
  $("ul.ds-refresh-menu li").click(function(e) {
    var target = $(e.target).parent();
    if (target.attr('data-ds-range')) {
      var range = target.attr('data-ds-range');
      cronenberg.dashboards.set_time_range(range, null);
      $("ul.ds-refresh-menu li[data-ds-range]").removeClass('active');
      $("ul.ds-refresh-menu li[data-ds-range=" + range + "]").addClass('active');
    } else if (target.attr('data-ds-interval')) {
      var interval = target.attr('data-ds-interval');
      cronenberg.dashboards.set_refresh_interval(interval);
      $("ul.ds-refresh-menu li[data-ds-interval]").removeClass('active');
      $("ul.ds-refresh-menu li[data-ds-interval=" + interval + "]").addClass('active');
    }
  });
});
