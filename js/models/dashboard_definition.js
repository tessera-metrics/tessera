ds.models.dashboard_definition = function(data) {
  "use strict";

  var queries = {}
    , options = {}
    , container
    , base
    , self = {};

  if (data && data.queries) {
    // For now the on-the-wire query map is string/string. Eventually
    // it will be come string/object as we move thresholds into the
    // queries instead of presentations.
    for (var key in data.queries) {
      var query = ds.models.data.Query({name: key, targets: data.queries[key]});
      queries[key] = query;
    }
  }
  base = ds.models.item(data).set_type('dashboard_definition').rebind(self);
  container = ds.models.container(data).rebind(self);

  Object.defineProperty(self, 'queries', {get: function() { return queries; }});

  /**
   * Operations
   */

  self.render_templates = function(context) {
    for (var key in queries) {
      queries[key].render_templates(context);
    }
    return self;
  }

  self.visit = function(visitor) {
    visitor(self);
    container.visit(visitor);
    return self;
  }

  self.load_all = function(options_) {
    options = options_ || options;
    for (var key in queries) {
      queries[key].load(options);
    }
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
    var q = {}
    for (var key in queries) {
      q[key] = queries[key].toJSON()
    }
    return container.toJSON(base.toJSON({
      queries: q
    }));
  }

  return self;
};
