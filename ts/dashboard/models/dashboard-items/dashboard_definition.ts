module ts {
  export module models {
    export class DashboardDefinition extends Container {

      static meta: DashboardItemMetadata = {
        item_type: 'dashboard_definition'
        category: false,
        template: ds.templates.models.definition
      }

      queries: ts.models.data.QueryDictionary = {}
      options: any = {}

      constructor(data?: any) {
        super(data)
        if (data && data.queries) {
          for (var key in data.queries) {
            var query = data.queries[key]
            this.queries[key] = (typeof(query) === 'string' || query instanceof Array)
              ? new ts.models.data.Query({name: key, targets: query})
            : new ts.models.data.Query(query)
          }
        }
      }

      /**
       * Operations
       */

      summarize() {
        var counts : any = {}
        this.visit((item) => {
          if (typeof(counts[item.item_type]) === 'undefined') {
            counts[item.item_type] = 1
          } else {
            counts[item.item_type] = counts[item.item_type] + 1
          }
        })
        return counts
      }

      render_templates(context?: any) : void {
        for (var key in this.queries) {
          this.queries[key].render_templates(context)
        }
        this.visit((item) => {
          if (item.query_override) {
            item.query_override.render_templates(context)
          }
          if ((item !== this) && item.render_templates) {
            item.render_templates(context)
          }
        })
      }

      cleanup() {
        for (var key in this.queries) {
          this.queries[key].off()
        }
      }

      list_queries() {
        return Object.keys(this.queries).map((key) => {
          return this.queries[key]
        })
      }

      load_all(options) {
        this.options = options || this.options

        var queries_to_load : any = {}
        var queries_to_fire : any = {}

        this.visit((item) => {
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

        var promises = Object.keys(queries_to_load).map((key) => {
          var query = queries_to_load[key]
          if (query) {
            var future = queries_to_load[key].load(this.options, false)
            return future ? future.promise() : undefined
          } else {
            return undefined
          }
        })

        Object.keys(queries_to_fire).forEach((key) => {
          var query = queries_to_fire[key]
          if (query) {
            queries_to_fire[key].load(this.options, true /* fire_only */)
          }
        })

        $.when(promises).done(() => {
          // TODO: This isn't *quite* what I want - this fires after all
          // the HTTP requests for the queries are complete, but the
          // done() handlers are not (i.e. we're not actually done
          // munging the data yet).
          ds.event.fire(ds.app, ds.app.Event.QUERIES_COMPLETE)
        })
        return this
      }

      add_query(query) {
        this.queries[query.name] = query
        query.options = this.options
        return this
      }

      /**
       * Delete a query and null out any references to it.
       */
      delete_query(query_name) {
        this.visit((item) => {
          if (item.query && (item.query.name === query_name)) {
            item.query = undefined
          }
        })
        delete this.queries[query_name]
        return this
      }

      /**
       * Rename a query and update any references to it.
       */
      rename_query(old_name, new_name) {
        var query = this.queries[old_name]
        if (!query)
          return this
        var updated = []
        this.visit((item) => {
          if (item.query && (item.query.name == old_name)) {
            item.query = new_name
            updated.push(item)
          }
        })
        query.name = new_name
        this.add_query(query)
        delete this.queries[old_name]
        return updated
      }

      toJSON() : any {
        var q : any = {}
        for (var key in this.queries) {
          q[key] = this.queries[key].toJSON()
        }
        return $.extend(super.toJSON(), {
          queries: q
        })
      }
    } // end class DashboardDefinition
    ts.models.register_dashboard_item(DashboardDefinition)
  }
}
