ds.models.donut_chart = function(data) {
  "use strict";

  var query_name
    , chart
    , base
    , item = {};

  if (data) {
    query_name = data.query_name;
  }
  chart = ds.models.chart(data);
  base = ds.models.item(data);

  base.type('donut_chart');
  item.base = base;
  item.chart = chart;

  d3.rebind(item, base, 'type', 'css_class', 'element_id', 'height', 'style');
  d3.rebind(item, chart, 'title', 'options');

  /**
   * Data accessors
   */

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

 item.toJSON = function() {
    return base.toJSON({
      options: chart.options(),
      title: chart.title(),
      query_name: query_name
    });
  }

  return item;
};
