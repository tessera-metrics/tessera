import * as core from '../../core'
import Summation from './summation'
import Model from '../model'
import * as app from '../../app/app'
import * as charts from '../../charts/core'
import * as graphite from '../../data/graphite'

declare var $, ts, require
const log = core.logger('query')

const axios   = require('axios')
const URI     = require('urijs')

export interface QueryDictionary {
  [index: string] : Query
}

export default class Query extends Model {
  static DEFAULT_FROM_TIME = '-3h'

  targets: string[]
  name: string
  data: graphite.DataSeriesList
  summation: Summation
  options: any
  expanded_targets: string[]
  local_options: any

  private load_count: number = 0
  private cache: Map<string, any> = new Map<string, any>()

  constructor(data: any) {
    super(data)
    if (data) {
      if (data instanceof Array) {
        this.targets = data
      } else if (typeof(data) === 'string') {
        this.targets = [data]
      } else if (data.targets) {
        if (data.targets instanceof Array) {
          this.targets = data.targets
        } else {
          this.targets = [data.targets]
        }
      }
      if (data.options) {
        this.options = data.options
      }
      this.name = data.name
    }
  }

  set_name(name: string) : Query {
    this.name = name
    return this
  }

  set_options(options: any) : Query {
    this.options = options
    return this
  }

  render_templates(context: any) : void {
    this.expanded_targets = this.targets.map(t => {
      return core.render_template(t, context)
    })
  }

  url(opt?: any) : string {
    let options = core.extend({}, this.local_options, opt, this.options)
    let url     = new URI(options.base_url || app.config.GRAPHITE_URL)
      .segment('render')
      .setQuery('format', options.format || 'png')
      .setQuery('from', options.from || app.config.DEFAULT_FROM_TIME || Query.DEFAULT_FROM_TIME)
      .setQuery('tz', app.config.DISPLAY_TIMEZONE)
    if (options.until) {
      url.setQuery('until', options.until)
    }
    let targets = this.expanded_targets || this.targets
    for (let t of targets) {
      url.addQuery('target', t.replace(/(\r\n|\n|\r)/gm,''))
    }
    return url.href()
  }

  /**
   * Return true if the item's query has the graphite stacked()
   * function anywhere in it. If you have stacked() in the query and
   * areaMode=stack in the URL, bad shit will happen to your graph.
   */
  is_stacked() : boolean {
    let targets = this.expanded_targets || this.targets
    if (typeof(targets) === 'undefined')
      return false
    let stacked = false
    this.targets.forEach(function(target) {
      if (target.indexOf('stacked') > -1) {
        stacked = true
      }
    })
    return stacked
  }

  /**
   * Asynchronously load the data for this query from the graphite
   * server, notifying any listening consumers when the data is
   * available.
   *
   * @param {Object} opt Parameters for generating the URL to
   * load. Valid properties are:
   *   * base_url (required)
   *   * from
   *   * until
   *   * ready callback
   * @param {boolean} fire_only Just raise the event, without fetching
   *                            data.
   */
  async load(opt?: any, fire_only: boolean = false) : Promise<graphite.DataSeriesList> {
    this.local_options = core.extend({}, this.local_options, opt)
    let options = core.extend({}, this.local_options, opt, this.options)

    if (fire_only) {
      core.events.fire(this, 'ds-data-ready', this)
      return Promise.resolve(this.data)
    }

    this.cache.clear()
    options.format = 'json'
    let url = this.url(options)
    this.load_count += 1

    let axios_config : any = {
      url: url,
      method: 'get'
    }

    let auth = app.config.GRAPHITE_AUTH ? app.config.GRAPHITE_AUTH.trim() : ''
    if (auth) {
      let [username, password] = auth.split(':')
      axios_config.auth = {
        username: username,
        password: password
      }
      axios_config.withCredentials = true
    }

    try {
      core.events.fire(this, 'ds-data-loading')
      let response = await axios(axios_config)
      this._summarize(response.data)
      core.events.fire(this, 'ds-data-ready', this)
      return this.data
    } catch (e) {
      ts.manager.error(`Error loading query ${this.name}: ${e.message}`)
    }
    return Promise.resolve(this.data)
  }

  /**
   * Register an event handler to be called when the query's data is
   * loaded.
   */
  on_load(handler: any) : void {
    log.debug(`on(): ${this.name}`)
    core.events.on(this, 'ds-data-ready', handler)
  }

  /**
   * Remove all registered event handlers.
   */
  off() : void {
    log.debug(`off(): ${this.name}`)
    core.events.off(this, 'ds-data-ready')
  }

  cleanup() : void {
    this.off()
    this.cache.clear()
    this.data = null
  }

  _group_targets() : string {
    return (this.targets.length > 1)
      ? `group(${this.targets.join(',')})`
      : this.targets[0]
  }

  /**
   * Return a new query with the targets timeshifted.
   */
  shift(interval: string) {
    let group = this._group_targets()
    return new Query({
      name: `${this.name}_shift_${interval}`,
      targets: [
        `timeShift(${group}, "${interval}")`
      ]
    })
  }

  /**
   * Return a new query with the targets from this query and another
   * query joined into a 2-target array, for comparison presentations.
   */
  join(other) : Query {
    let target_this  = this._group_targets()
    let target_other = other._group_targets()
    return new Query({
      name: `${this.name}_join_${other.name}`,
      targets: [
        target_this,
        target_other
      ]
    })
  }

  /**
   * Process the results of executing the query, transforming
   * the returned structure into something consumable by the
   * charting library, and calculating sums.
   */
  _summarize(response_data) : Query {
    this.summation = new Summation(response_data)
    this.data = response_data.map((series) => {
      series.summation = new Summation(series).toJSON()
      return series
    })
    return this
  }

  /**
   * Fetch data processed for use by a particular chart renderer, and
   * cache it in the query object so it's not re-processed over and
   * over.
   */
  chart_data(type: string) : any {
    let cache_key = 'chart_data_' + type
    if (!this.cache.has(cache_key)){
      this.cache.set(cache_key, charts.process_data(this.data, type))
    }
    return this.cache.get(cache_key)
  }

  toJSON() : any {
    return core.extend(super.toJSON(), {
      name: this.name,
      targets: this.targets,
      data: this.data,
      summation: this.summation ? this.summation.toJSON() : undefined,
      options: this.options
    })
  }
}
