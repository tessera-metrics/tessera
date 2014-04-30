ds.models.stacked_area_chart = function(data) {
  "use strict";

  var query_name
    , chart
    , base
    , item = {};

  if (data) {
    query_name = data.query_name;
    chart = ds.models.chart(data);
    base = ds.models.item(data);
  } else {
    chart = ds.models.chart();
    base = ds.models.item();
  }

  base.type('stacked_area_chart');
  item.base = base;
  item.chart = chart;

  ds.rebind(item, base, 'type', 'css_class', 'element_id', 'height', 'style');
  ds.rebind(item, chart, 'title', 'options');

  item.query_name = function(_) {
    if (!arguments.length) return query_name;
    query_name = _;
    return item;
  }

  item.chart = function(_) {
    if (!arguments.length) return chart;
    chart = _;
    return item;
  }

 item.to_json = function() {
    return base.to_json({
      options: chart.options(),
      title: chart.title(),
      query_name: query_name
    });
  }

  return item;
};
