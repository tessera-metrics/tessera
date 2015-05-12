import events from '../../core/event'
import Model  from '../model'
import Action from '../../core/action'
import { TemplateFunction, compile_template } from '../../core/template'
import { PropertyList } from '../../core/property'
import Query, { QueryDictionary } from '../data/query'
import { make } from './factory'
import { logger } from '../../core/log'

const log = logger('item')

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
  SUM:           'sum',
  MIN:           'min',
  MAX:           'max',
  MEAN:          'mean',
  MEDIAN:        'median',
  FIRST:         'first',
  LAST:          'last',
  LAST_NON_ZERO: 'last_non_zero',
  COUNT:         'count',
}

export interface DashboardItemVisitor {
  (item: DashboardItem) : void
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
  template?: string|TemplateFunction
  icon?: string
  actions?: Action[]
  interactive_properties?: PropertyList
}

/**
 * Base class for all things that can be displayed on a dashboard.
 */
export default class DashboardItem extends Model {
  item_id: string
  css_class: string
  height: number
  style: string
  title: string
  dashboard: any // TODO - Dashboard type when ready
  options: any

  constructor(data?: any) {
    super(data)
    if (data) {
      if (data.item_id) {
        this.item_id = data.item_id
      }
      this.title = data.title
      this.options = data.options
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

  get template() : string|TemplateFunction {
    return this.meta.template
  }

  get icon() : string {
    return this.meta.icon
  }

  get requires_data() : boolean {
    return this.meta.requires_data
  }

  /* Events ----------------------------------------- */

  /**
   * Fire a centralized 'update' event. Parties interested in
   * receiving events when an item is updated can register handlers
   * using the class (DashboardItem) as the target. The specific item
   * updated will be passed as the event data.
   */
  updated() : DashboardItem {
    log.info(`updated(): ${this.item_type}/${this.item_id}`)
    events.fire(DashboardItem, 'update', this)
    return this
  }

  /* Chainable setters ------------------------------ */

  // These were created automatically by the old `limivorous`
  // observable object library. The could be created automatically
  // by a utility function here too, but we'd lose the benefit of
  // type-checking.

  set_item_id(value: string) : DashboardItem {
    this.item_id = value
    return this.updated()
  }

  set_height(value: number) : DashboardItem {
    this.height = value
    return this.updated()
  }

  set_style(value: string) : DashboardItem {
    this.style = value
    return this.updated()
  }

  set_css_class(value: string) : DashboardItem {
    this.css_class = value
    return this.updated()
  }

  set_dashboard(value: any /* TODO */) : DashboardItem {
    this.dashboard = value
    return this
  }

  set_title(value: string) : DashboardItem {
    this.title = value
    return this.updated()
  }

  /* Core methods ------------------------------ */

  /** Override this method in sub classes that have strings which
   * should be template-expanded before rendering. */
  render_templates(context?: any) : void { }

  interactive_properties() : PropertyList {
    return [
      { name: 'css_class', category: 'base'} ,
      'height'
    ]
  }

  render() : string {
    if (!this.meta.template) {
      return "<p>Item type <code>" + this.item_type + "</code> is missing a template.</p>"
    }
    return compile_template(this.template)({item: this})
  }

  visit(visitor: DashboardItemVisitor) : DashboardItem {
    visitor(this)
    return this
  }

  clone() : DashboardItem {
    return make(this.toJSON()).set_item_id(null)
  }

  flatten() : DashboardItem[] {
    let flat = []
    this.visit(item => {
      flat.push(item)
    })
    return flat
  }

  // TODO - this should be moved out of the base class into a utility
  // module.
  get_queries() : QueryDictionary {
    let queries : QueryDictionary = {}
    this.visit(item => {
      // Doh! Circular dependency. Definitely move this out.
      // if (item instanceof Presentation) {
      if (item['query']) {
        let q = item['query'] || item['query_override']
        if (q) {
          queries[q.name] = q
        }
      }
    })
    return queries
  }

  toJSON() : any {
    return {
      title: this.title,
      options: this.options,
      item_type: this.item_type,
      item_id: this.item_id,
      css_class: this.css_class,
      height: this.height,
      style: this.style
    }
  }
}
