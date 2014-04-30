ds.models.dashboard_definition = function(data) {
  "use strict";

  var queries = {}
    , container
    , base
    , item = {};

  if (data) {
    queries = data.queries || queries
  }
  base = ds.models.item(data);
  container = ds.models.container(data);

  base.type('dashboard');
  item.base = base;
  item.container = container;

  ds.rebind(item, base, 'type', 'css_class', 'element_id', 'height', 'style');
  ds.rebind(item, container, 'items', 'add');

  item.queries = function(_) {
    if (!arguments.length) return queries;
    queries = _;
    return item;
  }

  item.toJSON = function() {
    return container.toJSON(base.toJSON({
      queries: queries
    }));
  }

  return item;
};
