  $(document).on('click', 'button.ds-refresh-button', function(e) {
    ds.manager.refresh();
  });

  $(document).on('click', 'ul.ds-refresh-menu li', function(e) {
    var target = $(e.target).parent();
    if (target.attr('data-ds-range')) {
      var range = target.attr('data-ds-range');
      ds.manager.set_time_range(range, null);
      $("ul.ds-refresh-menu li[data-ds-range]").removeClass('active');
      $("ul.ds-refresh-menu li[data-ds-range=" + range + "]").addClass('active');
    } else if (target.attr('data-ds-interval')) {
      var interval = target.attr('data-ds-interval');
      ds.manager.set_refresh_interval(interval);
      $("ul.ds-refresh-menu li[data-ds-interval]").removeClass('active');
      $("ul.ds-refresh-menu li[data-ds-interval=" + interval + "]").addClass('active');
    }
  });
