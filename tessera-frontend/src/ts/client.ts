import {
  logger, json
} from './util'
import {
  Dashboard, DashboardTuple, DashboardCategory, Tag, Preferences
} from './models'

declare var require
const axios = require('axios')

const log = logger('client')

export interface DashboardGetOptions {
  definition?: boolean
}

export interface DashboardListOptions {
  tag?: string
  category?: string
  path?: string
}

/**
 * Client for the Tessera REST API.
 */
export default class Client {

  prefix: string

  constructor(data?: any) {
    if (data) {
      this.prefix = data.prefix
    }
  }

  _uri(path: string) : string {
    return (this.prefix && !path.startsWith(this.prefix))
      ? `${this.prefix}${path}` : path
  }

  async _get(path: string, options: any = {}) : Promise<any> {
    let uri = this._uri(path)
    log.debug(`GET ${uri}`)
    return axios.get(uri, options)
  }

  async _put(path, data) : Promise<any> {
    let uri = this._uri(path)
    log.debug(`PUT ${uri}`)
    return axios.put(uri, json(data), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  async _post(path, data) : Promise<any> {
    let uri = this._uri(path)
    log.debug(`POST ${uri}`)
    return axios.post(uri, json(data), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  async _delete(path) : Promise<any> {
    let uri = this._uri(path)
    log.debug(`DELETE ${uri}`)
    return axios.delete(uri)
  }

  /* ----------------------------------------
     Dashboard API
     ---------------------------------------- */

  async dashboard_get(href: string, options: DashboardGetOptions = {}) : Promise<Dashboard> {
    return this._get(href, { params: options })
      .then(response => new Dashboard(response.data))
  }

  async dashboard_get_for_rendering(id: number) : Promise<DashboardTuple> {
    return this._get(`/api/dashboard/${id}/for-rendering`)
      .then(response => new DashboardTuple(response.data))
  }

  async dashboard_get_by_id(id: string|number, options: DashboardGetOptions = {}) : Promise<Dashboard> {
    return this.dashboard_get(`/api/dashboard/${id}`, options)
  }

  async dashboard_create(db: Dashboard) : Promise<any> {
    return this._post('/api/dashboard/', db)
  }

  async dashboard_update(db: Dashboard) : Promise<any> {
    return this._put(db.href, db)
  }

  async dashboard_update_definition(db: Dashboard) : Promise<any> {
    return this._put(db.definition_href, db.definition)
  }

  /**
   * Delete a dashboard.
   *
   * @param db A dashboard instance, href, or ID.
   */
  async dashboard_delete(db: Dashboard|string|number) : Promise<any> {
    if (typeof db === 'string') {
      return this._delete(db)
    } else if ( typeof db === 'number' ) {
      return this._delete(`/api/dashboard/${db}`)
    } else if (db instanceof Dashboard) {
      return this._delete(db.href)
    }
  }

  /**
   * List all dashboards, or dashboards filtered by tag or category.
   */
  async dashboard_list(options: DashboardListOptions = {}) : Promise<Dashboard[]> {
    if (options.tag) {
      return this._get(`/api/dashboard/tagged/${options.tag}`)
        .then(response => response.data.map(d => new Dashboard(d)))
    } else if (options.category) {
      return this._get(`/api/dashboard/category/${options.category}`)
        .then(response => response.data.map(d => new Dashboard(d)))
    } else {
      return this._get(options.path || '/api/dashboard/')
        .then(response => response.data.map(d => new Dashboard(d)))
    }
  }

  /**
   * List all dashboard categories.
   */
  async dashboard_categories() : Promise<DashboardCategory[]> {
    return this._get('/api/dashboard/category/')
      .then(response => response.data)
  }

  /* ----------------------------------------
     Tag API
     ---------------------------------------- */

  /**
   * List all tags.
   */
  async tag_list() : Promise<Tag[]> {
    return this._get('/api/tag/')
      .then(response => response.data.map(d => new Tag(d)))
  }

  /**
   * Get a tag by href.
   */
  async tag_get(href: string) : Promise<Tag> {
    return this._get(href)
      .then(response => new Tag(response.data[0]))
  }

  /**
   * Get a tag by ID.
   */
  async tag_get_by_id(id: number|string) : Promise<Tag> {
    return this._get(`/api/tag/${id}`)
      .then(response => new Tag(response.data[0]))
  }

  /* ----------------------------------------
     Preferences
     ---------------------------------------- */

  /**
   * Get the preferences for the current user.
   */
  async preferences_get() : Promise<Preferences> {
    return this._get('/api/preferences')
      .then(response => new Preferences(response.data))
  }
}
