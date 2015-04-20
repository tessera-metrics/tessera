ds.register_dashboard_item('dashboard_definition', {

  category: false,

  constructor: function(data) {
    "use strict"

    var self = limivorous.observable()
                         .property('queries', {init: {}})
                         .property('options', {init: {}})
                         .extend(ds.models.item, {item_type: 'dashboard_definition'})
                         .extend(ds.models.container)
                         .build()
      , log = ds.log.logger('tessera.item.definition')

    if (data && data.queries) {
      for (var key in data.queries) {
        var query = data.queries[key]
        self.queries[key] = (typeof(query) === 'string' || query instanceof Array)
                          ? ds.models.data.Query({name: key, targets: query})
                          : ds.models.data.Query(query)
      }
    }
    ds.models.item.init(self, data)
    ds.models.container.init(self, data)

    /**
     * Operations
     */

    self.summarize = function() {
      var counts = {}
      self.visit(function(item) {
        if (typeof(counts[item.item_type]) === 'undefined') {
          counts[item.item_type] = 1
        } else {
          counts[item.item_type] = counts[item.item_type] + 1
        }
      })
      return counts
    }

    self.render_templates = function(context) {
      for (var key in self.queries) {
        self.queries[key].render_templates(context)
      }
      self.visit(function(item) {
        if (item.query_override) {
          item.query_override.render_templates(context)
        }
        if ((item !== self) && item.render_templates) {
          item.render_templates(context)
        }
      })
      return self
    }

    self.cleanup = function() {
      log.debug('cleanup()')
      for (var key in self.queries) {
        self.queries[key].off()
      }
    }

    self.list_queries = function() {
      return Object.keys(self.queries).map(function(key) {
        return self.queries[key]
      })
    }

    self.load_all = function(options) {
      log.debug('load_all()')
      self.options = options || self.options

      var queries_to_load = {}
      var queries_to_fire = {}

      self.visit(function(item) {
        var query = item.query_override || item.query
        if (query) {
          if (item.requires_data || ds.charts.interactive) {
            queries_to_load[query.name] = query
            delete queries_to_fire[query.name]
          } else {
            if (!queries_to_load[query.name]) {
              queries_to_fire[query.name] = query
            }
          }
        }
      })

      var promises = Object.keys(queries_to_load).map(function(key) {
        var query = queries_to_load[key]
        if (query) {
          var future = queries_to_load[key].load(self.options, false)
          return future ? future.promise() : undefined
        } else {
          return undefined
        }
      })

      Object.keys(queries_to_fire).forEach(function(key) {
        var query = queries_to_fire[key]
        if (query) {
          queries_to_fire[key].load(self.options, true /* fire_only */)
        }
      })

      $.when(promises).done(function() {
        // TODO: This isn't *quite* what I want - this fires after all
        // the HTTP requests for the queries are complete, but the
        // done() handlers are not (i.e. we're not actually done
        // munging the data yet).
        ds.event.fire(ds.app, ds.app.Event.QUERIES_COMPLETE)
      })
      return self
    }

    self.add_query = function(query) {
      self.queries[query.name] = query
      query.options = self.options
      return self
    }

    /**
     * Delete a query and null out any references to it.
     */
    self.delete_query = function(query_name) {
      self.visit(function(item) {
        if (item.query && (item.query.name === query_name)) {
          item.query = undefined
        }
      })
      delete self.queries[query_name]
      return self
    }

    /**
     * Rename a query and update any references to it.
     */
    self.rename_query = function(old_name, new_name) {
      var query = self.queries[old_name]
      if (!query)
        return self
      var updated = []
      self.visit(function(item) {
        if (item.query && (item.query.name == old_name)) {
          item.query = new_name
          updated.push(item)
        }
      })
      query.name = new_name
      self.add_query(query)
      delete self.queries[old_name]
      return updated
    }

    self.toJSON = function() {
      var q = {}
      for (var key in self.queries) {
        q[key] = self.queries[key].toJSON()
      }
      return ds.models.container.json(self, ds.models.item.json(self, {queries: q}))
    }

    return self
  },

  template: ds.templates.models.definition

})
