//
// TODO - all of this needs refactoring
//

import * as core     from '../core'
import * as app      from './app'
import * as charts   from '../charts/core'
import Client        from '../client'
import Dashboard     from '../models/dashboard'
import DashboardItem from '../models/items/item'
import Container     from '../models/items/container'
import Query         from '../models/data/query'
import {transforms}  from '../models/transform/transform'

declare var $, URI, window, bootbox, ts

const log = core.logger('manager')

class DashboardHolder {
  url : string
  element : any
  dashboard : Dashboard

  constructor(url, element) {
    this.url = url
    this.element = element
    this.dashboard = null
  }

  setRange(from, until) {
    let url = new URI(this.url)
    if (from) {
      url.setQuery('from', from)
    }
    if (until) {
      url.setQuery('until', until)
    }
    this.url = url.href()
  }
}

export class Manager {
  current: any /* DashboardHolder */
  current_transform: any
  current_list: Dashboard[]
  client: Client

  constructor(client?: Client) {
    this.client = client ? client : new Client()
  }

  set_current(value) : Manager {
    this.current = value
    return this
  }

  find(href: string) : Dashboard {
    if (!this.current_list)
      return null
    return this.current_list.find(d => d.href === href)
  }

  /**
   * Register an event handler for processing a dashboard once it's
   * loaded and ready.
   */
  onDashboardLoaded(handler) : Manager {
    core.events.on(this, app.Event.DASHBOARD_LOADED, handler)
    return this
  }

  /**
   * List all dashboards.
   */
  list(path, handler) : void {
    this.client.dashboard_list({path: path})
      .then(handler)
      .catch((req, status, error) => {
        this.error(`Error listing dashboards. ${error}`)
      })
  }

  // Web Components. I want Web Components. TBD.
  render_dashboard_list(path, element, handler?) : void {
    let mgr = this
    let fn = (data) => {
      if (data && data.length) {
        this.current_list = data
        if (handler) {
          handler(data)
        }
        $(element).html(ts.templates.listing.dashboard_list({dashboards: data}))
        ts.user.list_favorites().forEach(function(d) {
          $('[data-ds-href="' + d.href + '"].ds-favorite-indicator').html('<i class="fa fa-lg fa-star"></i>')
          $('[data-ds-href="' + d.href + '"]').addClass('ds-favorited')
          $('tr[data-ds-href="' + d.href + '"]').addClass('active')
        })
      }
    }
    if (path instanceof Array) {
      fn(path)
    } else {
      this.list(path, fn)
    }
  }

  default_error_handler(xhr, status, error) : void {
    console.log(xhr)
    console.log(status)
    console.log(error)
  }

  error(message, options: any = {}) : void {
    options.type = options.type || 'danger'
    $.notify({
      message: message,
      title: 'Error',
      icon: 'fa fa-exclamation-circle'
    }, options)
  }

  warning(message, options: any = {}) : void {
    options.type = options.type || 'warning'
    $.notify({
      message: message,
      title: options.title || 'Warning',
      icon: options.icon || 'fa fa-exclamation-circle'
    }, options)
  }

  success(message, options: any = {}) : void {
    options.type = options.type || 'success'
    $.notify({
      message: message,
      title: options.title || 'Success',
      icon: options.icon || 'fa fa-check-circle'
    }, options)
  }

  /**
   * Set up us the API call.
   */
  _prep_url(base_url: string, options: any) : any {
    let url = new URI(base_url).setQuery('rendering', true)
    let context = app.context(url.query(true))

    context.from = options.from || context.from
    context.until = context.until || options.until

    url.setQuery('from', context.from)
    if (context.until) {
      url.setQuery('until', context.until)
    }

    context.url = url.href()

    if (typeof(options.interactive) != 'undefined') {
      context.interactive = options.interactive
    } else if (context.params.interactive) {
      context.interactive = context.params.interactive != 'false'
    }

    return context
  }

  cleanup() : void {
    if (this.current && this.current.dashboard) {
      this.current.dashboard.visit(item => item.cleanup())
    }
  }

  /**
   * Load and render a dashboard.
   */
  load(url: string, element, options: any = {}) : Manager {
    log.debug('load(): ' + url)

    this.cleanup()
    let holder = new DashboardHolder(url, element)
    let context = this._prep_url(url, options)
    this.set_current(holder)
    $.ajax({
      dataType: "json",
      url: context.url
    }).error((xhr, status, error) => {
      this.error('Error loading dashboard. ' + error)
    }).done((data) => {
      let dashboard = new Dashboard(data)
      holder.dashboard = dashboard

      let r = context.variables.renderer || data.preferences.renderer
      if (typeof context.variables.interactive != 'undefined') {
        r = context.variables.interactive === 'false' ? 'graphite' : 'flot'
      }
      if (r) {
        charts.set_renderer(r)
      }

      core.events.fire(this, app.Event.DASHBOARD_LOADED, dashboard)

      // Expand any templatized queries or dashboard items
      dashboard.render_templates(context.variables)

      // Render the dashboard
      $(element).html(dashboard.definition.render())

      let currentURL = new URI(holder.url)
      core.events.fire(this, app.Event.RANGE_CHANGED, {
        from: currentURL.query('from'),
        until: currentURL.query('until')
      })

      if (this.current_transform) {
        this.apply_transform(this.current_transform.transform, this.current_transform.target, false, context)
      } else {
        // Load the queries
        dashboard.definition.load_all({
          from: context.from,
          until: context.until
        })
      }

      core.events.fire(this, app.Event.DASHBOARD_RENDERED, dashboard)

      if (context.params.mode) {
        app.switch_to_mode(context.params.mode)
      } else {
        app.refresh_mode()
      }
    })
    return this
  }

  /**
   * Re-render a dashboard item and update its DOM representation.
   */
  update_item_view(item) : void {
    let element = $('#' + item.item_id)
    // REFACTOR - unchecked global reference
    let visible = ts.edit.details_visibility(item)
    element.replaceWith(item.render())
    if (visible) {
      // REFACTOR - unchecked global reference
      ts.edit.show_details(item.item_id)
    }
    item.visit((i) => {
      let query = i.query_override || i.query
      if (query && query instanceof Query) {
        log.debug('update_item_view(): reloading query ' + query.name)
        query.load()
      }
    })
    app.refresh_mode()
  }

  /**
   * Execute a function with re-rendering of the DOM for dashboard
   * items disabled.
   */
  without_updates(handler) : any {
    let fn = Manager.prototype.update_item_view
    Manager.prototype.update_item_view = function() { }
    try {
      return handler()
    } finally {
      Manager.prototype.update_item_view = fn
    }
  }

  handle_popstate(event) : void {
    if (!event.state) {
      this.current_transform = undefined
      this.refresh()
      app.switch_to_mode('standard')
    } else {
      if (event.state.transform) {
        let item = this.current.dashboard.get_item(event.state.target.item_id)
        this.apply_transform(event.state.transform.name, item, false)
      } else if (event.state.url) {
          this.current_transform = undefined
        this.refresh()
        app.switch_to_mode('standard')
      }
    }
  }


  remove_transform() : Manager {
    if (this.current && this.current_transform) {
      window.location = new URI(window.location)
        .path(this.current.dashboard.view_href)
        .href()
      this.current_transform = undefined
    }
    return this
  }

  apply_transform(transform, target, set_location: boolean = true, context?: any) : Manager {
    let dashboard = this.current.dashboard

    if (typeof(transform) === 'string')
      transform = transforms.get(transform)

    log.debug('apply_transform(' + transform.name + ')')

    if (transform.transform_type == 'dashboard' && typeof(target) === 'undefined') {
      target = dashboard.definition
    }

    /**
     * Set browser URL state
     */
    if (set_location) {
      let url = new URI(window.location)
      if (target.item_type != 'dashboard_definition') {
        url.segment(target.item_id.toString())
      }
      url.segment('transform').segment(transform.name)
      window.history.pushState({ url:this.current.url,
                                 element:this.current.element,
                                 transform:transform.toJSON(),
                                 target:target.toJSON() }, '', url.href())
    }

    /**
     * update_item_view() reloads queries, which we don't want to do
     * while processing the transform.
     */
    let result = this.without_updates(() => {
      return transform.transform(target)
    })

    result.visit((item) => {
      item.set_dashboard(dashboard)
    })

    dashboard.definition.queries = result.get_queries() // this could go in an observer
    dashboard.set_items([result])

    $('#' + dashboard.definition.item_id).replaceWith(dashboard.render())
    dashboard.render_templates(app.context().variables)
    if (context) {
      dashboard.load_all({
        from: context.from,
        until: context.until
      })
    } else {
      dashboard.load_all()
    }

    if ((transform.transform_type === 'presentation') && (app.instance.current_mode != app.Mode.EDIT)) {
      app.switch_to_mode('transform')
      this.current_transform = {
        transform: transform,
        target: target
        }
    }

    return this
  }

  refresh() : void {
    log.debug('refresh()')
    if (this.current && (app.instance.current_mode != app.Mode.EDIT)) {
      this.load(this.current.url, this.current.element)
    } else {
      log.debug('skipping reload; current mode: ' + app.instance.current_mode)
    }
  }

  // Definitely getting to the point we need some kind of reactive MVC
  // here
  toggle_interactive_charts() : void {
    this.client.preferences_get()
      .then((data) => {
        let setting = !data.interactive
        let dashboard_url = new URI(this.current.url)
        let window_url = new URI(window.location)

        if (window_url.hasQuery('interactive', 'true')) {
          setting = false
        } else if (window_url.hasQuery('interactive', 'false')) {
          setting = true
        }

        dashboard_url.setQuery('interactive', setting)
        window_url.setQuery('interactive', setting)
        this.current.url = dashboard_url.href()
        window.history.pushState({url: this.current.url, element:this.current.element}, '', window_url.href())
        this.refresh()
        return setting
      })
  }

  /* -----------------------------------------------------------------------------
     Time range and auto-refresh
     ----------------------------------------------------------------------------- */

  set_time_range(from, until) : void {
    let uri = new URI(window.location)
    from
      ? uri.setQuery('from', from)
      : uri.removeQuery('from')
    until
      ? uri.setQuery('until', until)
      : uri.removeQuery('until')

    window.history.pushState({url: this.current.url, element:this.current.element}, '', uri.href())

    this.current.setRange(from, until)
    core.events.fire(this, app.Event.RANGE_CHANGED, {
      from: from, until: until
    })
    this.refresh()
  }

  static ranges = {
    // TODO - quick hack. Parse the range and generate on the fly
    // for maximum flexibiliy
    '-1h'  : 'Past Hour',
    '-2h'  : 'Past 2 Hours',
    '-3h'  : 'Past 3 Hours',
    '-4h'  : 'Past 4 Hours',
    '-6h'  : 'Past 6 Hours',
    '-12h' : 'Past 12 Hours',
    '-1d'  : 'Past Day',
    '-7d'  : 'Past Week'
  }

  getRangeDescription(range: string) : string {
    if (range in Manager.ranges) {
      return Manager.ranges[range]
    } else {
      return null
    }
  }

  onRangeChanged(handler) : void {
    core.events.on(this, app.Event.RANGE_CHANGED, handler)
  }

  autoRefreshInterval: number
  intervalSeconds: number
  intervalId: any = null

  set_refresh_interval(value) : void {
    let intervalSeconds = parseInt(value)
    this.autoRefreshInterval = intervalSeconds
    if (this.intervalId) {
      log.debug('clearing auto-refresh interval; intervalId: ' + this.intervalId)
      window.clearInterval(this.intervalId)
      this.intervalId = undefined
    }
    if (intervalSeconds > 0) {
      this.intervalSeconds = intervalSeconds
      this.intervalId = window.setInterval(() => { this.refresh() }, intervalSeconds * 1000)
      log.debug('set auto-refresh interval; intervalId: ' + this.intervalId + '; seconds: ' + intervalSeconds)
    }
  }

  delete_with_confirmation(href, handler?) : void {
    bootbox.dialog({
      message: "Are you really sure you want to delete this dashboard? Deletion is irrevocable.",
      title: "Confirm dashboard delete",
      backdrop: false,
      buttons: {
        cancel: {
          label: "Cancel",
          className: "btn-default",
          callback: () => {
            // TODO - notification
          }
        },
        confirm: {
          label: "Delete",
          className: "btn-danger",
          callback: () => {
            this.delete_dashboard(href, handler)
          }
        }
      }
    })
  }

  delete_dashboard(href, handler?) : void {
    let done : any = handler || (() => {
      window.location.href = '/dashboards'
      this.success('Successfully deleted dashboard ' + href)
    })
    this.client.dashboard_delete(href)
      .then(done)
      .catch((request, status, error) => {
        this.error(`Error deleting dashboard ${href}. ${error}`)
      })
  }

  delete_current() : void {
    this.delete_with_confirmation(this.current.dashboard.href)
  }

  create(input, handler?) : void {
    let dashboard = null
    if (typeof input === 'string') {
      let json = JSON.parse(input)
      dashboard = new Dashboard(json)
    } else if (input instanceof Dashboard) {
      dashboard = input
    } else {
      dashboard = new Dashboard(input)
    }

    this.client.dashboard_create(dashboard)
      .then(handler)
      .catch((request, status, error) => {
        this.error(`Error creating dashboard. ${error}`)
      })
  }

  update(dashboard, handler?) : void {
    this.client.dashboard_update(dashboard)
      .then(handler)
      .catch((request, status, error) => {
        this.error('Error updating dashboard ' + dashboard.title + '. ' + error)
      })
  }

  update_definition(dashboard: any, handler?) : void {
    if (app.instance.current_mode === app.Mode.TRANSFORM) {
      this.warning(`Unable to save dashboad while a transform is applied.
Revert to standard mode in order to save changes.`)
      return
    }
    this.client.dashboard_update_definition(dashboard)
      .then(handler)
      .catch((request, status, error) => {
        this.error(`Error updating dashboard definition ${dashboard.title}. ${error}`)
      })
  }

  duplicate(href: string, handler?) : void {
    let err = (request, status, error) => {
      this.error(`Error duplicating dashboard ${href}. ${error}`)
    }
    this.client.dashboard_get(href, { definition: true })
      .then((db) => {
        db.title = `Copy of ${db.title}`
        db.id = null
        this.client.dashboard_create(db)
          .then(handler)
          .catch(err)
      })
      .catch(err)
  }
}

const manager = new Manager()

core.events.on(DashboardItem, 'update', (e: { target: DashboardItem }) => {
  if (!e || !e.target) {
    log.warn('on:DashboardItem.update: item not bound')
  } else {
    let item = e.target
    log.debug(`on:DashboardItem.update: ${item.item_type} / ${item.item_id}`)
    if (item instanceof Container && manager.current) {
      manager.current.dashboard.update_index()
    }
    manager.update_item_view(item)
  }
})

window.addEventListener('popstate', (e) => {
  manager.handle_popstate(e)
})

app.add_mode_handler(app.Mode.STANDARD, {
  enter: () => {
    manager.remove_transform()
  }
})

export default manager
