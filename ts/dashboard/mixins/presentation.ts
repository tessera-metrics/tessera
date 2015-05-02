module ts {
  export module models {

    /**
     * The base class for all _presentations_, or dashboard items
     * which present data in some manner.
     */
    export class Presentation extends DashboardItem {

      private _query: string|ts.models.data.Query
      private _query_override: string|ts.models.data.Query

      constructor(data?: any) {
        super(data)
        if (data) {
          this._query = data.query
        }
      }

      /* Query Accessors ------------------------------ */

      get is_immediate_query() : boolean {
        return typeof(this._query) !== 'string'
      }

      get query() : ts.models.data.Query {
        if (typeof this._query === 'string' && this.dashboard) {
          return this.dashboard.definition.queries[<string>this._query]
        } else {
          return <ts.models.data.Query>this._query
        }
      }

      set query(value: ts.models.data.Query) {
        if (this.dashboard.definition.queries[value.name]) {
          this._query = value.name
        } else {
          this._query = value
        }
      }

      get query_override() : ts.models.data.Query {
        if (typeof this._query_override === 'string' && this.dashboard) {
          return this.dashboard.definition.queries[<string>this._query_override]
        } else {
          return <ts.models.data.Query>this._query_override
        }
      }

      set query_override(value: ts.models.data.Query) {
        this._query_override = value
      }

      /* Chainable setters ------------------------------ */

      set_query(value: string|ts.models.data.Query) : DashboardItem {
        this._query = value
        return this
      }

      set_query_override(value: string|ts.models.data.Query) : DashboardItem {
        this._query_override = value
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
        /* No need to render this.query here if it's not an immediate
         * query, because that's handled by dashboard_definition */
        if (this.is_immediate_query) {
          this.query.render_templates(context)
        }
        if (this.query_override) {
          this.query_override.render_templates(context)
        }
      }

      render() : string {
        if (this.query || this.query_override) {
          let query = this.query_override || this.query
          if (typeof(query) === 'string') {
            return `<p>ERROR: unresolved query <code>${query}</code>`
              + `for item <code>${this.item_id}</code>`
          } else {
            (<ts.models.data.Query>query).on_load(q => {
              this.data_handler(q)
            })
          }
        }
        return super.render()
      }

      toJSON() : any {
        let data = super.toJSON()
        if (this.query) {
          data.query = this.is_immediate_query
            ? (<ts.models.data.Query>this._query).toJSON()
            : this._query
        }
        return data
      }

    }
  }
}
