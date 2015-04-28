
/**
 * Hook up syntax highlighting to marked' markdown processor, so code
 * blocks will be highlighted.
 */
marked.setOptions({
  highlight: function(code) {
    return hljs.highlightAuto(code).value
  }
})

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
    return moment(value).tz(ds.config.DISPLAY_TIMEZONE).fromNow()
  } else {
    return moment(value).tz(ds.config.DISPLAY_TIMEZONE).format(format)
  }
})

Handlebars.registerHelper('format', function(format, value) {
  if (typeof(value) === 'undefined')
    return ''
  if (!format)
    return value
  try {
    return d3.format(format)(value)
  } catch ( e ) {
    console.log('Error formatting ' + format + ' / ' + value + ': ' + e.message)
    return value
  }
})

/**
 * Fetch the list of dashboards with a given tag and return a Markdown
 * list of links to them.
 */
Handlebars.registerHelper('dashboards-tagged', function(tag) {
  var markdown = ''
  $.ajax({
    url: ds.uri('/api/dashboard/tagged/' + tag),
    type: 'GET',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.length; i++) {
        var d = data[i]
        markdown += '  * ['
        if (d.category && d.category !== '') {
          markdown += d.category + ': '
        }
        markdown += d.title + ']('
        markdown += d.view_href + ')\n'
      }
    },
    error: function() {
      var error = 'Unable to retrieve list of dashboards tagged "' + tag + '"'
      ds.manager.warning(error)
      markdown = error
    }
  })
  return new Handlebars.SafeString(markdown)
})

/* -----------------------------------------------------------------------------
   Internal helpers
   ----------------------------------------------------------------------------- */

Handlebars.registerHelper('height', function(item) {
  var height = item.height
  if (item.is_chart && !height) {
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
  var context = { item: item }
  var template = undefined
  if (item.item_type === 'cell') {
    template = ds.templates["ds-edit-bar-cell"]
  } else if (item.item_type === 'row') {
    template = ds.templates["ds-edit-bar-row"]
  } else if (item.item_type === 'section') {
    template = ds.templates["ds-edit-bar-section"]
  } else {
    template = ds.templates["ds-edit-bar-item"]
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
  property = ds.property.get(property)
  if (!property)
    return ''
  return new Handlebars.SafeString(property.render(item))
})

/**
 * Render a list of actions. The actions are selected by category from
 * the global actions registry (`ds.actions`), and can be rendered
 * either as a button bar or a dropdown.
 */
Handlebars.registerHelper('actions', function(category, type) {
  let template = type === 'button'
        ? ds.templates.action_button
        : ds.templates.action
  let actions = ds.actions.list(category)
  if (actions && actions.length) {
      if (typeof type === 'boolean' && type) {
          actions = [ds.action.divider].concat(actions)
      }

    var html = ''
    for (let action of actions) {
     if (!action)
         continue
      var tmpl = template
      if (action.actions) {
        tmpl = ds.templates["action-menu-button"]
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
