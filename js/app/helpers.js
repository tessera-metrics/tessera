
marked.setOptions({
  highlight: function(code) {
    return hljs.highlightAuto(code).value
  }
})

Handlebars.registerHelper('markdown', function(value) {
  if (!value)
    return ''
  return new Handlebars.SafeString(marked(value))
})

Handlebars.registerHelper('json', function(value) {
  return new Handlebars.SafeString(hljs.highlightAuto(JSON.stringify(value, null, '  ')).value)
})

Handlebars.registerHelper('moment', function(format, value) {
  if (!value)
    return ''
  if (format == 'fromNow') {
    return moment(value).fromNow()
  } else {
    return moment(value).format(format)
  }
})

Handlebars.registerHelper('format', function(format, value) {
  if (!value)
    return ''
  return d3.format(format)(value)
})

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
    }
  }  else {
    return ''
  }
})

Handlebars.registerHelper('item', function(item) {
  if (!item)
    return ''
  return new Handlebars.SafeString(item.render())
})

Handlebars.registerHelper('interactive_property', function(property, item) {
  var html = '<span id="' + item.item_id + property.name + '">'
           + property.render(item)
           + '</span>'
  return new Handlebars.SafeString(html)
})


Handlebars.registerHelper('actions', function(category, type) {
  var template = ds.templates.action
  if (type === 'button') {
    template = ds.templates.action_button
  }
  var actions = ds.actions.list(category)
  if (actions && (actions instanceof Array)) {
    var html = ''
    for (var i in actions) {
      var action = actions[i]
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
