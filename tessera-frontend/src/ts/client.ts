import * as core from './core'
import * as model from './models'

declare var $, Promise, require
const log   = core.logger('client')
const axios = require('axios')

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
 *
 * TODO - find an isomorphic HTTP lib to remove the jQuery dependence,
 * so this client can eventually be isomorphic too (ditto for the
 * models and their rendering).
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
    return axios.put(uri, core.json(data), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  async _post(path, data) : Promise<any> {
    let uri = this._uri(path)
    log.debug(`POST ${uri}`)
    return axios.post(uri, core.json(data), {
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

  async dashboard_get(href: string, options: DashboardGetOptions = {}) : Promise<model.Dashboard> {
    return this._get(href, { params: options })
      .then(response => new model.Dashboard(response.data))
  }

  async dashboard_get_for_rendering(id: number) : Promise<model.DashboardTuple> {
    return this._get(`/api/dashboard/${id}/for-rendering`)
      .then(response => new model.DashboardTuple(response.data))
  }

  async dashboard_get_by_id(id: string|number, options: DashboardGetOptions = {}) : Promise<model.Dashboard> {
    return this.dashboard_get(`/api/dashboard/${id}`, options)
  }

  async dashboard_create(db: model.Dashboard) : Promise<any> {
    return this._post('/api/dashboard/', db)
  }

  async dashboard_update(db: model.Dashboard) : Promise<any> {
    return this._put(db.href, db)
  }

  async dashboard_update_definition(db: model.Dashboard) : Promise<any> {
    return this._put(db.definition_href, db.definition)
  }

  /**
   * Delete a dashboard.
   *
   * @param db A dashboard instance, href, or ID.
   */
  async dashboard_delete(db: model.Dashboard|string|number) : Promise<any> {
    if (typeof db === 'string') {
      return this._delete(db)
    } else if ( typeof db === 'number' ) {
      return this._delete(`/api/dashboard/${db}`)
    } else if (db instanceof model.Dashboard) {
      return this._delete(db.href)
    }
  }

  async dashboard_list(options: DashboardListOptions = {}) : Promise<model.Dashboard[]> {
    if (options.tag) {
      return this._get(`/api/dashboard/tagged/${options.tag}`)
        .then(response => response.data.map(d => new model.Dashboard(d)))
    } else if (options.category) {
      return this._get(`/api/dashboard/category/${options.category}`)
        .then(response => response.data.map(d => new model.Dashboard(d)))
    } else {
      return this._get(options.path || '/api/dashboard/')
        .then(response => response.data.map(d => new model.Dashboard(d)))
    }
  }

  async dashboard_categories() : Promise<model.DashboardCategory[]> {
    return this._get('/api/dashboard/category/')
      .then(response => response.data)
  }

  /* ----------------------------------------
     Tag API
     ---------------------------------------- */

  async tag_list() : Promise<model.Tag[]> {
    return this._get('/api/tag/')
      .then(response => response.data.map(d => new model.Tag(d)))
  }

  async tag_get(href: string) : Promise<model.Tag> {
    return this._get(href)
      .then(response => new model.Tag(response.data[0]))
  }

  async tag_get_by_id(id: number|string) : Promise<model.Tag> {
    return this._get(`/api/tag/${id}`)
      .then(response => new model.Tag(response.data[0]))
  }

  /* ----------------------------------------
     Preferences
     ---------------------------------------- */

  async preferences_get() : Promise<model.Preferences> {
    return this._get('/api/preferences')
      .then(response => new model.Preferences(response.data))
  }
}
