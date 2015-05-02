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
      meta?: DashboardItemMetadata
    }

    export interface DashboardItemMetadata {
      item_type?: string
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
     * TODO: Combine metadata from base classes by walking up the
     * prototype chain as long as there's a 'meta' field
     */
    export class DashboardItem extends Model {
      item_id: string
      css_class: string
      height: number
      style: string
      interactive: boolean // TODO - this can probably go away
      dashboard: any // TODO - Dashboard type when ready

      constructor(data?: any) {
        super(data)
        if (data) {
          if (data.item_id)
            this.item_id = data.item_id
          this.css_class = data.css_class
          this.height = data.height
          this.style = data.style
          this.dashboard = data.dashboard
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

      /* Core methods ------------------------------ */

      /** Override this method in sub classes that have strings which
       * should be template-expanded before rendering. */
      render_templates(context?: any) : void { }

      interactive_properties() : PropertyListEntry[] {
        return [
          { name: 'css_class', category: 'base'} ,
          { name: 'height', type: 'number', category: 'base' }
        ]
      }

      render() : string {
        if (!this.meta.template) {
          return "<p>Item type <code>" + this.item_type + "</code> is missing a template.</p>"
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
          if (item instanceof Presentation) {
            let q = item.query || item.query_override
            if (q) {
              queries[q.name] = q
            }
          }
        })
        return queries
      }

      toJSON() : any {
        let data : any = {}
        data.item_type = this.item_type
        if (this.item_id)
          data.item_id = this.item_id
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
