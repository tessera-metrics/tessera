module ts {
  export module models {

    export const DashboardItemStyle = {
      WELL:            'well',
      CALLOUT_NEUTRAL: 'callout_neutral',
      CALLOUT_INFO:    'callout_info',
      CALLOUT_SUCCESS: 'callout_success',
      CALLOUT_WARNING: 'callout_warning',
      CALLOUT_DANGER:  'callout_danger',
      ALERT_NEUTRAL:   'alert_neutral',
      ALERT_INFO:      'alert_info',
      ALERT_SUCCESS:   'alert_success',
      ALERT_WARNING:   'alert_warning',
      ALERT_DANGER:    'alert_danger',
    }

    export const Transform = {
      SUM: 'sum',
      MIN: 'min',
      MAX: 'max',
      MEAN: 'mean',
      MEDIAN: 'median'
    }

    // TODO: move to property.ts
    export type PropertyListEntry = string|ts.PropertyDescriptor
    export type PropertyList      = PropertyListEntry[]

    export interface DashboardItemVisitor {
      (item: DashboardItem) : void;
    }

    export interface DashboardItemConstructor {
      new(data?: any) : DashboardItem;
    }

    export interface DashboardItemMetadata {
      item_type: string
      requires_data?: boolean
      category?: string
      display_name?: string
      template?: string|ts.TemplateFunction
      icon?: string,
      actions?: ts.Action[]
      interactive_properties?: PropertyList
    }

    /**
     * Base class for all things that can be displayed on a dashboard.
     *
     * TODO: Query-related logic should be split out into a subclass
     * (call it Presentation).
     * TODO: Combine metadata from base classes by waking up the
     * prototype chain as long as there's a 'meta' field
     */
    export class DashboardItem extends Model {
      item_id: string
      css_class: string
      height: number
      style: string
      interactive: boolean
      dashboard: any // TODO - Dashboard type when ready
      is_dashboard_item: boolean = true // TODO - remove this
      private _query: string|ts.models.data.Query
      private _query_override: string|ts.models.data.Query

      constructor(data?: any) {
        super(data)
        if (data) {
          if (data.item_id)
            this.item_id = data.item_id
          this._query = data.query
          this.css_class = data.css_class
          this.height = data.height
          this.style = data.style
        }
      }

      /* Metadata Accessors ------------------------------ */

      get meta() : DashboardItemMetadata {
        return Object.getPrototypeOf(this).constructor.meta
      }

      get item_type() : string {
        return this.meta.item_type
      }

      get item_category() : string {
        return this.meta.category
      }

      get display_name() : string {
        return this.meta.display_name
      }

      get template() : string|ts.TemplateFunction {
        return this.meta.template
      }

      get icon() : string {
        return this.meta.icon
      }

      get requires_data() : boolean {
        return this.meta.requires_data
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

      // These were created automatically by the old `limivorous`
      // observable object library. The could be created automatically
      // by a utility function here too, but we'd lose the benefit of
      // type-checking.

      set_item_id(value: string) : DashboardItem {
        this.item_id = value
        return this
      }

      set_height(value: number) : DashboardItem {
        this.height = value
        return this
      }

      set_style(value: string) : DashboardItem {
        this.style = value
        return this
      }

      set_css_class(value: string) : DashboardItem {
        this.css_class = value
        return this
      }

      set_interactive(value: boolean) : DashboardItem {
        this.interactive = value
        return this
      }

      set_dashboard(value: any /* TODO */) : DashboardItem {
        this.dashboard = value
        return this
      }

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

      /** Override this method in sub classes that have strings which
       * should be template-expanded before rendering. */
      render_templates(context?: any) : void { }

      interactive_properties() : PropertyListEntry[] {
        return [
          'query',
          { name: 'css_class', category: 'base'} ,
          { name: 'height', type: 'number', category: 'base' }
        ]
      }

      render() : string {
        if (!this.meta.template) {
          return "<p>Item type <code>" + this.item_type + "</code> is missing a template.</p>"
        }

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
        return (<ts.TemplateFunction>this.meta.template)({item: this})
      }

      visit(visitor: DashboardItemVisitor) : DashboardItem {
        visitor(this)
        return this
      }

      clone() : DashboardItem {
        return ts.models.make(this.toJSON()).set_item_id(null)
      }

      flatten() : DashboardItem[] {
        let flat = []
        this.visit(item => {
          flat.push(item)
        })
        return flat
      }

      get_queries() : ts.models.data.QueryDictionary {
        let queries : ts.models.data.QueryDictionary = {}
        this.visit(item => {
          let q = item.query || item.query_override
          if (q instanceof ts.models.data.Query) {
            queries[q.name] = q
          }
        })
        return queries
      }

      toJSON() : any {
        let data : any = {}
        data.item_type = this.item_type
        if (this.item_id)
          data.item_id = this.item_id
        if (this.query) {
          data.query = this.is_immediate_query
            ? (<ts.models.data.Query>this._query).toJSON()
            : this._query
        }
        if (this.css_class)
          data.css_class = this.css_class
        if (this.height)
          data.height = this.height
        if (this.style)
          data.style = this.style
        return data
      }
    } // end class DashboardItem
  }
}
