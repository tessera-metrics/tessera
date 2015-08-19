import * as core from './core'
import * as model from './models'

declare var $, Promise
const log = core.logger('client')

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

  _get(path: string, options: any, converter?) {
    let uri = this._uri(path)
    log.debug(`GET ${uri}`)
    return new Promise((resolve, reject) => {
      $.ajax(core.extend({
        type: 'GET',
        url: uri,
        dataType: 'json',
        success: (data) => {
          if (converter) {
            data = converter(data)
          }
          resolve(data)
        },
        error: (request, status, error) => {
          reject({request, status, error})
        }
      }, options))
    })
  }

  _put(path, data) {
    let uri = this._uri(path)
    log.debug(`PUT ${uri}`)
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'PUT',
        url: uri,
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(core.json(data)),
        success: (response) => {
          resolve(response)
        },
        error: (request, status, error) => {
          reject({request, status, error})
        }
      })
    })
  }

  _post(path, data) {
    let uri = this._uri(path)
    log.debug(`POST ${uri}`)
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        url: uri,
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(core.json(data)),
        success: (response) => {
          resolve(response)
        },
        error: (request, status, error) => {
          reject({request, status, error})
        }
      })
    })
  }

  _delete(path) {
    let uri = this._uri(path)
    log.debug(`DELETE ${uri}`)
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'DELETE',
        url: uri,
        success: (data) => {
          resolve(data)
        },
        error: (request, status, error) => {
          reject({request, status, error})
        }
      })
    })
  }

  /* ----------------------------------------
     Dashboard API
     ---------------------------------------- */

  dashboard_get(href: string, options: DashboardGetOptions = {}) {
    return this._get(href, { data: options },
                     (data) => {
                       return new model.Dashboard(data)
                     })
  }

  dashboard_get_for_rendering(id: number) {
    return this._get(`/api/dashboard/${id}/for-rendering`, {},
                     (data) => {
                       return new model.DashboardTuple(data)
                     })
  }

  dashboard_get_by_id(id: string|number, options: DashboardGetOptions = {}) {
    return this.dashboard_get(`/api/dashboard/${id}`, options)
  }

  dashboard_create(db: model.Dashboard) {
    return this._post('/api/dashboard/', db)
  }

  dashboard_update(db: model.Dashboard) {
    return this._put(db.href, db)
  }

  dashboard_update_definition(db: model.Dashboard) {
    return this._put(db.definition_href, db.definition)
  }

  /**
   * Delete a dashboard.
   *
   * @param db A dashboard instance, href, or ID.
   */
  dashboard_delete(db: model.Dashboard|string|number) {
    if (typeof db === 'string') {
      return this._delete(db)
    } else if ( typeof db === 'number' ) {
      return this._delete(`/api/dashboard/${db}`)
    } else if (db instanceof model.Dashboard) {
      return this._delete(db.href)
    }
  }

  dashboard_list(options: DashboardListOptions = {}) {
    if (options.tag) {
      return this._get(`/api/dashboard/tagged/${options.tag}`, {}, (data) => {
        return data.map(d => new model.Dashboard(d))
      })
    } else if (options.category) {
      return this._get(`/api/dashboard/category/${options.category}`, {}, (data) => {
        return data.map(d => new model.Dashboard(d))
      })
    } else {
      return this._get(options.path || '/api/dashboard/', {}, (data) => {
        return data.map(d => new model.Dashboard(d))
      })
    }
  }

  dashboard_categories() {
    return this._get('/api/dashboard/category/', {})
  }

  /* ----------------------------------------
     Tag API
     ---------------------------------------- */

  tag_list() {
    return this._get('/api/tag/', {})
  }

  tag_get(href: string) {
    return this._get(href, {}, (data) => new model.Tag(data[0]))
  }

  tag_get_by_id(id: number|string) {
    return this._get(`/api/tag/${id}`, {}, (data) => new model.Tag(data[0]))
  }

  /* ----------------------------------------
     Preferences
     ---------------------------------------- */

  preferences_get() {
    return this._get('/api/preferences', {}, (data) => new model.Preferences(data))
  }
}
