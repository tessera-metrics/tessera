ds.models.factory = function(data) {

  var dispatch_table = {
    singlestat:           ds.models.singlestat,
    jumbotron_singlestat: ds.models.jumbotron_singlestat,
    summation_table:      ds.models.summation_table,
    simple_time_series:   ds.models.simple_time_series,
    standard_time_series: ds.models.standard_time_series,
    stacked_area_chart:   ds.models.stacked_area_chart,
    donut_chart:          ds.models.donut_chart,
    singlegraph:          ds.models.singlegraph,
    separator:            ds.models.separator,
    heading:              ds.models.heading,
    markdown:             ds.models.markdown,
    cell:                 ds.models.cell,
    row:                  ds.models.row,
    section:              ds.models.section,
    dashboard:            ds.models.dashboard_definition
  }

  if (data.type && typeof(data.type) == 'function') {
    return data;
  } else if (data.item_type && dispatch_table[data.item_type]) {
    return dispatch_table[data.item_type](data);
  } else {
    console.log('Unknown type');
    console.log(data);
    return null;
  }
}
