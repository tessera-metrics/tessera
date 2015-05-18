import Container from './container'
import Presentation from './presentation'
import { DashboardItemMetadata } from './item'
import Query, { QueryDictionary } from '../data/query'
import { register_dashboard_item } from './factory'
import { extend } from '../../core/util'
import { logger } from '../../core/log'
import * as charts from '../../charts/core'

declare var $, ts
const log = logger('models.dashboard_definition')

export default class DashboardDefinition extends Container {
  static meta: DashboardItemMetadata = {
    template: ts.templates.models.definition
  }

  queries: QueryDictionary = {}
  options: any = {}

  constructor(data?: any) {
    super(data)
    if (data && data.queries) {
      for (let key in data.queries) {
        let query = data.queries[key]
        this.queries[key] = (typeof(query) === 'string' || query instanceof Array)
          ? new Query({name: key, targets: query})
        : new Query(query)
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
    this.visit((item) => {
      if ((item !== this) && item.render_templates) {
        item.render_templates(context)
      }
    })
  }

  cleanup() {
    for (let key in this.queries) {
      this.queries[key].off()
    }
  }

  list_queries() {
    return Object.keys(this.queries).map((key) => {
      return this.queries[key]
    })
  }

  load_all(options?: any) {
    log.debug('load_all()')
    this.options = options || this.options

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

    let promises = Object.keys(queries_to_load).map((key) => {
      let query = queries_to_load[key]
      if (query) {
        let future = queries_to_load[key].load(this.options, false)
        return future ? future.promise() : undefined
      } else {
        return undefined
      }
    })

    Object.keys(queries_to_fire).forEach((key) => {
      let query = queries_to_fire[key]
      if (query) {
        queries_to_fire[key].load(this.options, true /* fire_only */)
      }
    })

    $.when(promises).done(() => {
      // TODO: This isn't *quite* what I want - this fires after all
      // the HTTP requests for the queries are complete, but the
      // done() handlers are not (i.e. we're not actually done
      // munging the data yet).

      // TODO - use new event interface
      // ts.event.fire(ts.app.instance, ts.app.Event.QUERIES_COMPLETE)
    })
    return this
  }

  add_query(query) : DashboardDefinition {
    this.queries[query.name] = query
    query.options = this.options
    return this
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
    return this
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
        if (item.query && (item.query.name == old_name)) {
          item.query = new_name
          updated.push(item)
        }
      }
    })
    query.name = new_name
    this.add_query(query)
    delete this.queries[old_name]
    return updated
  }

  toJSON() : any {
    let q : any = {}
    for (let key in this.queries) {
      q[key] = this.queries[key].toJSON()
    }
    return extend(super.toJSON(), {
      queries: q
    })
  }
} // end class DashboardDefinition
register_dashboard_item(DashboardDefinition)
