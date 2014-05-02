
Handlebars.registerHelper('markdown', function(value) {
  if (!value)
    return '';
  return new Handlebars.SafeString(markdown.toHTML(value));
});

Handlebars.registerHelper('moment', function(format, value) {
  if (!value)
    return '';
  return moment(value).format(format);
});

Handlebars.registerHelper('format', function(format, value) {
  if (!value)
    return '';
  return d3.format(format)(value);
});

Handlebars.registerHelper('height', function(item) {
  return item.height ? 'ds-height' + item.height : '';
});

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
