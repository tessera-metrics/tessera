
marked.setOptions({
  highlight: function(code) {
    return hljs.highlightAuto(code).value
  }
})

Handlebars.registerHelper('markdown', function(value) {
  if (!value)
    return ''
  return new Handlebars.SafeString(marked(value));
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
  return item.span ? 'col-md-' + item.span : '';
});

Handlebars.registerHelper('offset', function(item) {
  return item.offset ? 'col-md-offset-' + item.offset : '';
});

Handlebars.registerHelper('css_class', function(item) {
  return item.css_class ? item.css_class : '';
});

Handlebars.registerHelper('container_class', function(item) {
  switch (item.layout) {
    case 'fixed': return 'container';
    case 'fluid': return 'container-fluid';
    default: return '';
  }
});

Handlebars.registerHelper('style_class', function(item) {
  if (item.style) {
    switch (item.style) {
      case 'well':
        return 'well';
      case 'callout_neutral':
        return 'bs-callout bs-callout-neutral';
      case 'callout_info':
        return 'bs-callout bs-callout-info';
      case 'callout_success':
        return 'bs-callout bs-callout-success';
      case 'callout_warning':
        return 'bs-callout bs-callout-warning';
      case 'callout_danger':
        return 'bs-callout bs-callout-danger';
    }
  }  else {
    return '';
  }
});

Handlebars.registerHelper('item', function(item) {
  if (!item)
    return '';
  return new Handlebars.SafeString(item.render())
});

Handlebars.registerHelper('actions', function(category) {
  var actions = ds.actions.list(category)
  if (actions && (actions instanceof Array)) {
    var html = ''
    for (var i in actions) {
      html += ds.templates.action(actions[i])
    }
    return new Handlebars.SafeString(html)
  } else {
    return ''
  }
})
