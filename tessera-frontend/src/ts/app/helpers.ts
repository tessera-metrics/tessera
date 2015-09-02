import Action, { actions as action_registry } from '../core/action'
import Chart from '../models/items/chart'
import * as app from './app'
import manager from './manager'
import { logger } from '../core/log'

declare var marked, hljs, Handlebars, moment, d3, $, ts

const log = logger('helpers')

/**
 * Hook up syntax highlighting to marked' markdown processor, so code
 * blocks will be highlighted.
 */
marked.setOptions({
  highlight: function(code) {
    return hljs.highlightAuto(code).value
  }
})

export function register_helpers() {
  /**
   * Render markdown content to HTML.
   */
  Handlebars.registerHelper('markdown', function(value) {
    if (!value)
      return ''
    return new Handlebars.SafeString(marked(value))
  })

  /**
   * Render an object to syntax-highlighted JSON.
   */
  Handlebars.registerHelper('json', function(value) {
    return new Handlebars.SafeString(hljs.highlightAuto(JSON.stringify(value, null, '  ')).value)
  })

  /**
   * Format a datetime value in the timezone configured for the current
   * tessera user.
   */
  Handlebars.registerHelper('moment', function(format, value) {
    if (!value)
      return ''
    if (format == 'fromNow') {
      return moment(value).tz(app.config.DISPLAY_TIMEZONE).fromNow()
    } else {
      return moment(value).tz(app.config.DISPLAY_TIMEZONE).format(format)
    }
    return ''
  })

  Handlebars.registerHelper('format', function(format, value) {
    if (typeof(value) === 'undefined')
      return ''
    if (!format)
      return value
    try {
      return d3.format(format)(value)
    } catch ( e ) {
      log.error('Error formatting ' + format + ' / ' + value + ': ' + e.message)
      return value
    }
  })

  /**
   * Fetch the list of dashboards with a given tag and return a Markdown
   * list of links to them.
   */
  Handlebars.registerHelper('dashboards-tagged', function(tag) {
    let markdown = ''
    $.ajax({
      url: app.uri('/api/dashboard/tagged/' + tag),
      type: 'GET',
      async: false,
      success: function(data) {
        for (let d of data) {
          markdown += '  * ['
          if (d.category && d.category !== '') {
            markdown += d.category + ': '
          }
          markdown += d.title + ']('
          markdown += d.view_href + ')\n'
        }
      },
      error: function() {
        let error = 'Unable to retrieve list of dashboards tagged "' + tag + '"'
        manager.warning(error)
        markdown = error
      }
    })
    return new Handlebars.SafeString(markdown)
  })

  /* -----------------------------------------------------------------------------
     Internal helpers
     ----------------------------------------------------------------------------- */

  Handlebars.registerHelper('height', function(item) {
    let height = item.height
    if (item instanceof Chart && !height) {
      height = 2
    }
    return height ? 'ds-height' + height : ''
  })

  Handlebars.registerHelper('span', function(item) {
    return item.span ? 'col-md-' + item.span : ''
  })

  Handlebars.registerHelper('offset', function(item) {
    return item.offset ? 'col-md-offset-' + item.offset : ''
  })

  Handlebars.registerHelper('css_class', function(item) {
    return item.css_class ? item.css_class : ''
  })

  Handlebars.registerHelper('container_class', function(item) {
    switch (item.layout) {
    case 'fixed': return 'container'
    case 'fluid': return 'container-fluid'
    default: return ''
    }
  })

  /**
   * Render the edit bar for any dashboard item.
   */
  Handlebars.registerHelper('ds-edit-bar', function(item) {
    let context = { item: item }
    let template = undefined
    if (item.item_type === 'cell') {
      template = ts.templates["ds-edit-bar-cell"]
    } else if (item.item_type === 'row') {
      template = ts.templates["ds-edit-bar-row"]
    } else if (item.item_type === 'section') {
      template = ts.templates["ds-edit-bar-section"]
    } else if (item.item_type === 'dashboard_definition') {
      template = ts.templates["ds-edit-bar-definition"]
    } else {
      template = ts.templates["ds-edit-bar-item"]
    }
    return template ? new Handlebars.SafeString(template(context)) : ''
  })

  Handlebars.registerHelper('style_class', function(item) {
    if (item.style) {
      switch (item.style) {
      case 'well':
        return 'well'
      case 'callout_neutral':
        return 'bs-callout bs-callout-neutral'
      case 'callout_info':
        return 'bs-callout bs-callout-info'
      case 'callout_success':
        return 'bs-callout bs-callout-success'
      case 'callout_warning':
        return 'bs-callout bs-callout-warning'
      case 'callout_danger':
        return 'bs-callout bs-callout-danger'
      case 'alert_neutral':
        return 'alert alert-neutral'
      case 'alert_info':
        return 'alert alert-info'
      case 'alert_success':
        return 'alert alert-success'
      case 'alert_warning':
        return 'alert alert-warning'
      case 'alert_danger':
        return 'alert alert-danger'
      default:
        return ''
      }
    }  else {
      return ''
    }
  })

  /**
   * Handlebars helper to render a dashboard item, by calling its
   * `render()` method.
   */
  Handlebars.registerHelper('item', function(item) {
    if (!item)
      return ''
    return new Handlebars.SafeString(item.render())
  })

  /**
   * Render an individual property for a property sheet.
   */
  Handlebars.registerHelper('interactive_property', function(property, item) {
    return new Handlebars.SafeString(property.render(item))
  })

  /**
   * Render a list of actions. The actions are selected by category from
   * the global actions registry (`ts.actions`), and can be rendered
   * either as a button bar or a dropdown.
   */
  Handlebars.registerHelper('actions', function(category, type) {
    let template = type === 'button'
      ? ts.templates.action_button
      : ts.templates.action
    let actions = action_registry.list(category)
    if (actions && actions.length) {
      if (typeof(type) === 'boolean' && type) {
        actions = actions.slice()
        actions.unshift(Action.DIVIDER)
      }

      let html = ''
      for (let action of actions) {
        if (!action)
          continue
        let tmpl = template
        if (action.actions) {
          tmpl = ts.templates["action-menu-button"]
        }
        html += tmpl({
          category: category,
          action: action
        })
      }
      return new Handlebars.SafeString(html)
    } else {
      return ''
    }
  })
}
