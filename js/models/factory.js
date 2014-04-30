ds.models.factory = function(data) {

  var dispatch_table = {
      singlestat:           ds.models.singlestat,
      jumbotron_singlestat: ds.models.jumbotron_singlestat,
      summation_table:      ds.models.summation_table,
      simple_time_series:   ds.models.simple_time_series
  }

  if (data.item_type && dispatch_table[data.item_type]) {
    return dispatch_table[data.item_type](data);
  } else {
    console.log('Unknown type');
    console.log(data);
    return None;
  }
}
