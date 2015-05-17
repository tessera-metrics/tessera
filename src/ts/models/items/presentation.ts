import * as core from '../../core'
import DashboardItem from './item'
import Query from '../data/query'

const log = core.logger('models.presentation')

/**
 * The base class for all _presentations_, or dashboard items
 * which render data in some manner.
 */
export default class Presentation extends DashboardItem {

  protected _query: string
  public query_override: Query

  constructor(data?: any) {
    super(data)
    if (data) {
      if (data.query && data.query.name) {
        this._query = data.query.name
      } else {
        this._query = data.query
      }
    }
  }

  /* Query Accessors ------------------------------ */

  get query() : Query {
    if (!this.dashboard) {
      log.error(`dashboard property not set on ${this.item_type} / ${this.item_id}`)
      return null
    }
    return this.dashboard.definition.queries[this._query]
  }

  set query(value: Query) {
    this._query = value.name
  }

  /* Chainable setters ------------------------------ */

  set_query(value: string|Query) : DashboardItem {
    if (typeof value === 'string') {
      this._query = value
    } else {
      this._query = value.name
    }
    return this.updated()
  }

  set_query_override(value: Query) : DashboardItem {
    this.query_override = value
    return this.updated()
  }

  /* Core methods ------------------------------ */

  /** Override this method in sub-classes to use query data to
   * render a dashboard element. */
  data_handler(query: Query) : void { }

  interactive_properties() : core.PropertyList {
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
    let query = this.query_override || this.query
    if (query) {
      query.on_load(q => {
        this.data_handler(q)
      })
    }
    return super.render()
  }

  toJSON() : any {
    return core.extend(super.toJSON(), {
      query: this._query
    })
  }
}
