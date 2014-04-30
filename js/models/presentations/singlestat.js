/**
 * Mirrors cronenberg.model.web.singlestat
 */
ds.models.singlestat = function(data) {
  "use strict";

  var query_name
    , title
    , units
    , format=',.3f'
    , index
    , transform='mean'
    , base
    , item = {};

  if (data) {
    query_name = data.query_name;
    title = data.title;
    units = data.units;
    format = data.format || format;
    index = data.index;
    transform = data.transform || transform;
    base = ds.models.item(data);
  } else {
    base = ds.models.item(data);
  }
  base.type('singlestat');

  item.base = base;

  ds.rebind(item, base, 'type', 'css_class', 'element_id', 'height', 'style');

  item.query_name = function(_) {
    if (!arguments.length) return query_name;
    query_name = _;
    return item;
  }

  item.title = function(_) {
    if (!arguments.length) return title;
    title = _;
    return item;
  }

  item.units = function(_) {
    if (!arguments.length) return units;
    units = _;
    return item;
  }

  item.format = function(_) {
    if (!arguments.length) return format;
    format = _;
    return item;
  }

  item.index = function(_) {
    if (!arguments.length) return index;
    index = _;
    return item;
  }

  item.transform = function(_) {
    if (!arguments.length) return transform;
    transform = _;
    return item;
  }

 item.toJSON = function() {
    return base.toJSON({
      title: title,
      query_name: query_name,
      format: format,
      transform: transform,
      units: units,
      index: index
    });
  }

  return item;
}
