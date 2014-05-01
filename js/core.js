var ds = window.ds || {};
ds.models = ds.models || {};

ds.render_template = function(str, context) {
  if (str == null) {
    return str;
  }
  if (str.indexOf('{{') == -1) {
    return str;
  } else {
    var template = Handlebars.compile(str);
    return template(context);
  }
}
