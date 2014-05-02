ds.models.dashboard_definition = function(data) {
  "use strict";

  // TODO: for now queries is a plain object mapping strings to
  // string. It should map strings to Query model objects that can
  // register listeners.
  var queries = {}
    , container
    , base
    , self = {};

  if (data) {
    queries = data.queries || queries
  }
  base = ds.models.item(data).set_type('dashboard_definition').rebind(self);
  container = ds.models.container(data).rebind(self);

  Object.defineProperty(self, 'queries', {get: function() { return queries; }});

  /**
   * Operations
   */

  self.render_templates = function(context) {
    for (var key in queries) {
      queries[key] = ds.render_template(queries[key], context);
    }
    return self;
  }

  self.visit = function(visitor) {
    visitor(self);
    container.visit(visitor);
    return self;
  }

  /**
   * Data accessors
   */

  self.set_queries = function(_) {
    queries = _;
    return self;
  }

  self.add_query = function(name, target) {
    queries[name] = target;
    return self;
  }

  self.toJSON = function() {
    return container.toJSON(base.toJSON({
      queries: queries
    }));
  }

  return self;
};
