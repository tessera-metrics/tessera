ds.models.simple_time_series = function(data) {
  "use strict";

  var query_name
    , filled = false
    , chart
    , base
    , item = {};

  if (data) {
    query_name = data.query_name;
    filled = data.filled !== false;
    chart = ds.models.chart(data);
    base = ds.models.item(data);
  } else {
    chart = ds.models.chart();
    base = ds.models.item();
  }

  base.type('simple_time_series');
  item.base = base;
  item.chart = chart;

  ds.rebind(item, base, 'type', 'css_class', 'element_id', 'height', 'style');
  ds.rebind(item, chart, 'title', 'options');

  item.query_name = function(_) {
    if (!arguments.length) return query_name;
    query_name = _;
    return item;
  }

  item.filled = function(_) {
    if (!arguments.length) return filled;
    filled = _;
    return item;
  }

  item.chart = function(_) {
    if (!arguments.length) return chart;
    chart = _;
    return item;
  }

  item.toJSON = function() {
    return base.toJSON({
      filled: filled,
      options: chart.options(),
      title: chart.title(),
      query_name: query_name
    });
  }

  return item;
};
