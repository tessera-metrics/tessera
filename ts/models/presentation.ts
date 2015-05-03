module ts {
  export module models {

    /**
     * The base class for all _presentations_, or dashboard items
     * which render data in some manner.
     */
    export class Presentation extends DashboardItem {

      protected _query: string
      public query_override: ts.models.data.Query

      constructor(data?: any) {
        super(data)
        if (data) {
          if (data.query && data.query instanceof ts.models.data.Query) {
            this._query = data.query.name
          } else {
            this._query = data.query
          }
        }
      }

      /* Query Accessors ------------------------------ */

      get query() : ts.models.data.Query {
        if (!this.dashboard) {
          return null
        }
        return this.dashboard.definition.queries[this._query]
      }

      set query(value: ts.models.data.Query) {
        this._query = value.name
      }

      /* Chainable setters ------------------------------ */

      set_query(value: string|ts.models.data.Query) : DashboardItem {
        if (typeof value === 'string') {
          this._query = value
        } else {
          this._query = value.name
        }
        return this
      }

      set_query_override(value: ts.models.data.Query) : DashboardItem {
        this.query_override = value
        return this
      }

      /* Core methods ------------------------------ */

      /** Override this method in sub-classes to use query data to
       * render a dashboard element. */
      data_handler(query: ts.models.data.Query) : void { }

      interactive_properties() : PropertyList {
        return super.interactive_properties().concat([
          'query'
        ])
      }

      render_templates(context?: any) : void {
        super.render_templates(context)
        /* No need to render this.query here, because they're shared,
         * and handled by dashboard_definition */
        if (this.query_override) {
          this.query_override.render_templates(context)
        }
      }

      render() : string {
        if (this.query || this.query_override) {
          let query = this.query_override || this.query
          query.on_load(q => {
            this.data_handler(q)
          })
        }
        return super.render()
      }

      toJSON() : any {
        return $.extend(super.toJSON(), {
          query: this._query
        })
      }
    }
  }
}
