ds.models.jumbotron_singlestat = function(data) {
  "use strict";

  var base = ds.models.singlestat(data)
    , item = {};

  base.type('jumbotron_singlestat');

  ds.rebind(item, base,
            'type', 'css_class', 'element_id', 'height', 'style',
            'query_name', 'thresholds',
            'title', 'units', 'format', 'index', 'transform', 'base', 'toJSON');

  return item;
}
