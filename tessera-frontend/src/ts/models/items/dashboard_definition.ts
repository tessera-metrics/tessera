import { logger, extend, events } from '../../util'
import Container from './container'
import Presentation from './presentation'
import { DashboardItemMetadata } from './item'
import Query, { QueryDictionary } from '../data/query'
import { PropertyList } from '../../core'
import * as charts from '../../charts/core'

declare var $, ts
const log = logger('models.dashboard_definition')

export default class DashboardDefinition extends Container {
  static meta: DashboardItemMetadata = {
    template: ts.templates.models.definition
  }

  queries: QueryDictionary = {}
  options: any = {}
  renderer: string

  constructor(data?: any) {
    super(data)
    if (data) {
      this.renderer = data.renderer
      if (data.queries) {
        for (let key in data.queries) {
          let query = data.queries[key]
          this.queries[key] = (typeof(query) === 'string' || query instanceof Array)
            ? new Query({name: key, targets: query})
          : new Query(query)
        }
      }
    }
  }

  /**
   * Operations
   */
  summarize() {
    let counts : any = {}
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
    for (let key in this.queries) {
      this.queries[key].render_templates(context)
    }
    // Render each query a second time to render any tags in
    // referenced queries.
    for (let key in this.queries) {
      this.queries[key].render_templates(context, true)
    }
    this.visit((item) => {
      if ((item !== this) && item.render_templates) {
        item.render_templates(context)
      }
    })
  }

  cleanup() {
    for (let key in this.queries) {
      this.queries[key].cleanup()
    }
  }

  list_queries() {
    return Object.keys(this.queries).map((key) => {
      return this.queries[key]
    })
  }

  async load_all(options?: any) : Promise<any> {
    log.debug('load_all()')
    this.options = options || this.options

    // First walk through the dashboard to collect the queries into
    // two collections - those which need to have raw data loaded and
    // those which don't.

    let queries_to_load : any = {}
    let queries_to_fire : any = {}

    this.visit((item) => {
      if (item instanceof Presentation) {
        let query = item.query_override || item.query
        if (query) {
          if (item.meta.requires_data || charts.get_renderer(item).is_interactive) {
            queries_to_load[query.name] = query
            delete queries_to_fire[query.name]
          } else {
            if (!queries_to_load[query.name]) {
              queries_to_fire[query.name] = query
            }
          }
        }
      }
    })

    const load_queries = (query_map, fire_only: boolean = false) : Promise<any> => {
      return Promise.all(Object.keys(query_map).map(key => {
        let query = query_map[key]
        return query
          ? query.load(this.options, fire_only)
          : Promise.resolve()
      }))
    }

    return Promise.all([
      load_queries(queries_to_load),
      load_queries(queries_to_fire, true)
    ]).then(() => {
      events.fire(ts.app.instance, ts.app.Event.QUERIES_COMPLETE)
      return Promise.resolve(true)
    })
  }

  add_query(query) : DashboardDefinition {
    this.queries[query.name] = query
    query.options = this.options
    return <DashboardDefinition> this.updated()
  }

  /**
   * Delete a query and null out any references to it.
   */
  delete_query(query_name) : DashboardDefinition {
    this.visit((item) => {
      if (item instanceof Presentation) {
        if (item.query && (item.query.name === query_name)) {
          item.query = undefined
        }
      }
    })
    delete this.queries[query_name]
    return <DashboardDefinition> this.updated()
  }

  /**
   * Rename a query and update any references to it.
   */
  rename_query(old_name, new_name) : any {
    let query = this.queries[old_name]
    if (!query)
      return this
    let updated = []
    this.visit((item) => {
      if (item instanceof Presentation) {
        if (item.query && (item.query.name === old_name)) {
          item.set_query(new_name)
          updated.push(item)
        }
      }
    })
    query.name = new_name
    this.add_query(query)
    delete this.queries[old_name]
    this.updated()
    return updated
  }

  interactive_properties() : PropertyList {
    return super.interactive_properties().concat([
      'chart.renderer'
    ])
  }

  toJSON() : any {
    let q : any = {}
    for (let key in this.queries) {
      q[key] = this.queries[key].toJSON()
    }
    return extend(super.toJSON(), {
      queries: q,
      renderer: this.renderer
    })
  }
} // end class DashboardDefinition
