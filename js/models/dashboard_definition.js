ds.models.dashboard_definition = function(data) {
  "use strict";

  var self = limivorous.observable()
                       .property('queries', {init: {}})
                       .property('options', {init: {}})
                       .extend(ds.models.item, {item_type: 'dashboard_definition'})
                       .extend(ds.models.container)
                       .build()

  if (data && data.queries) {
    // For now the on-the-wire query map is string/string. Eventually
    // it will be come string/object as we move thresholds into the
    // queries instead of presentations.
    for (var key in data.queries) {
      var query = ds.models.data.Query({name: key, targets: data.queries[key]})
      self.queries[key] = query
    }
  }
  ds.models.item.init(self, data)
  ds.models.container.init(self, data)

  /**
   * Operations
   */

  self.render_templates = function(context) {
    for (var key in self.queries) {
      self.queries[key].render_templates(context)
    }
    return self
  }

  self.load_all = function(options_) {
    self.options = options_ || self.options
    for (var key in self.queries) {
      self.queries[key].load(self.options)
    }
    return self
  }

  self.add_query = function(name, target) {
    self.queries[name] = target
    return self
  }

  self.toJSON = function() {
    var q = {}
    for (var key in self.queries) {
      q[key] = self.queries[key].toJSON()
    }
    return ds.models.container.json(self, ds.models.item.json(self, {queries: q}))
  }

  return self
}
