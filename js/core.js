var ds = window.ds || {};
ds.models = ds.models || {};
ds.models.data = ds.models.data || {};
ds.models.transform = ds.models.transform || {};

/**
 * Helper function to (potentially) render a template with a given
 * context object. If the string does not contain any handlebars tags,
 * it will be returned as-is.
 */
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

/**
 * Yo dawg, I heard you like objects, so I put some objects in your
 * objects...
 */
ds.extend = function() {
  var target = {}
  for (var i = 0; i < arguments.length; i++) {
    var source = arguments[i]
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key]
      }
    }
  }
  return target
}
