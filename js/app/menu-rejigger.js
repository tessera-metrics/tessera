cronenberg.dashboards.onDashboardLoaded(function(d) {
  $("ul.ds-rejigger-menu li").on('click', 'a', function(e) {
    var target = $(e.target).parent();
    var cols = target.attr('data-ds-cols');
    var section_type = target.attr('data-ds-section-type');

    var layout = ds.models.layout.SimpleGrid({
      section_type: section_type,
      columns: cols
    });

    cronenberg.dashboards.change_layout(layout);
  });
});
