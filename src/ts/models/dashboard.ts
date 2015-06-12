import * as core from '../core'
import Model from './model'
import Tag from './tag'
import Container from './items/container'
import DashboardDefinition from './items/dashboard_definition'
import DashboardItem from './items/item'
import Preferences from './preferences'
import { make } from './items/factory'

const log = core.logger('models.dashboard')

export default class Dashboard extends Model {

  id: string
  href: string
  view_href: string
  definition_href: string
  creation_date: Date
  last_modified_date: Date
  imported_from: string
  index: any = {}
  title: string
  expanded_title: string
  category: string
  summary: string
  expanded_summary: string
  description: string
  expanded_description: string
  definition: DashboardDefinition
  tags: Tag[] = []

  _next_id: number = 0

  constructor(data?: any) {
    super(data)
    if (data) {
      this.id = data.id
      this.title = data.title
      this.category = data.category
      this.summary = data.summary
      this.description = data.description
      this.definition = data.definition
      this.creation_date = data.creation_date
      this.last_modified_date = data.last_modified_date
      this.imported_from = data.imported_from
      this.href = data.href
      this.view_href = data.view_href
      this.definition_href = data.definition_href
      if (data.definition) {
        this.definition = make(data.definition)
      }
      if (data.tags && data.tags.length) {
        this.tags = data.tags.map(t => new Tag(t))
      }
      this.visit(item => {
        this._next_id++
      })
      this.next_id()
      this.update_index()
    }
  }

  set_tags(tags: string[]) : Dashboard {
    this.tags = tags.map(t => new Tag(t))
    return this
  }

  set_definition(definition: DashboardDefinition) : Dashboard {
    this.definition = definition
    this.update_index()
    return this
  }

  visit(visitor) : Dashboard {
    visitor(this)
    if (this.definition) {
      this.definition.visit(visitor)
    }
    return this
  }

  next_id() : string {
    while (true) {
      var id = 'd' + this._next_id++
      if (typeof(this.index[id]) === 'undefined') {
        return id
      }
    }
  }

  reindex() : Dashboard {
    this._next_id = 0
    this.visit(item => {
      item.item_id = this.next_id()
    })
    return this
  }

  update_index() : Dashboard {
    var index : any = {}
    this.visit((item) => {
      if (item instanceof DashboardItem) {
        if ( !item.item_id ) {
          item.item_id = this.next_id()
        }
        if (index[item.item_id]) {
          log.error('ERROR: item_id + ' + item.item_id + ' is already indexed.')
        }
        index[item.item_id] = item
        item.set_dashboard(this)
      }
    })
    this.index = index
    return this
  }

  /**
   * Operations
   */

  get_item(id) {
    return this.index[id]
  }

  find_parent(item_or_id) {
    var parent = undefined
    this.visit(item => {
      if (item instanceof Container && item.contains(item_or_id)) {
        parent = item
      }
    })
    return parent
  }

  set_items(items) : Dashboard {
    this.definition.items = items
    this.update_index()
    return this
  }

  render() : string {
    return this.definition.render()
  }

  load_all(options?: any) {
    this.definition.load_all(options)
    return self
  }

  cleanup() {
    this.definition.cleanup()
  }

  render_templates(context) : Dashboard {
    context.id = this.id
    this.expanded_description = core.render_template(this.description, context)
    this.expanded_title       = core.render_template(this.title, context)
    this.expanded_summary     = core.render_template(this.summary, context)
    if (this.definition) {
      this.definition.render_templates(context)
    }
    return <Dashboard> this.fire('change', {target: this})
  }

  flatten() {
    return this.definition ? this.definition.flatten() : []
  }

  toJSON() : any {
    return core.extend(super.toJSON(), {
      id: this.id,
      title: this.title,
      category: this.category,
      summary: this.summary,
      description: this.description,
      creation_date: this.creation_date,
      last_modified_date: this.last_modified_date,
      imported_from: this.imported_from,
      tags: this.tags.map(function(t) {
        return t.toJSON()
      }),
      definition: this.definition ? this.definition.toJSON() : null,
      href: this.href,
      view_href: this.view_href,
      definition_href: this.definition_href
    })
  }
}

export class DashboardTuple extends Model {
  dashboard: Dashboard
  preferences: Preferences

  constructor(data?: any) {
    super(data)
    if (data) {
      this.dashboard = new Dashboard(data.dashboard)
      this.preferences = new Preferences(data.preferences)
    }
  }

  toJSON() : any {
    return {
      dashboard: this.dashboard.toJSON(),
      preferences: this.preferences.toJSON()
    }
  }
}
