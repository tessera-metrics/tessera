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
  base = ds.models.item(data).set_type('dashboard_definition').rebind(item);
  container = ds.models.container(data).rebind(item);

  Object.defineProperty(item, 'queries', {get: function() { return queries; }});

  /**
   * Operations
   */

  item.render_templates = function(context) {
    for (var key in queries) {
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

  item.set_queries = function(_) {
    queries = _;
    return item;
  }

  item.add_query = function(name, target) {
    queries[name] = target;
    return item;
  }

  item.toJSON = function() {
    return container.toJSON(base.toJSON({
      queries: queries
    }));
  }

  return item;
};
