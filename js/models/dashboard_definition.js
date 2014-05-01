ds.models.dashboard_definition = function(data) {
  "use strict";

  // TODO: for now queries is a plain object mapping strings to
  // string. It should map strings to Query model objects that can
  // register listeners.
  var queries = {}
    , container
    , base
    , item = {};

  if (data) {
    queries = data.queries || queries
  }
  base = ds.models.item(data);
  container = ds.models.container(data);

  base.type('dashboard_definition');
  item.base = base;
  item.container = container;

  d3.rebind(item, base, 'type', 'css_class', 'element_id', 'height', 'style');
  d3.rebind(item, container, 'items', 'add');

  /**
   * Operations
   */

  item.render_templates = function(context) {
    for (key in queries) {
      queries[key] = ds.render_template(queries[key], context);
    }
    return item;
  }

  item.visit = function(visitor) {
    visitor(item);
    container.visit(visitor);
    return item;
  }

  /**
   * Data accessors
   */

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
