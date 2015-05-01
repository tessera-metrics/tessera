module ts {
  export interface TemplateFunction {
    (ctx?: any) : string
  }
}

var ds : any = window['ds'] || {}
ds.models = ds.models || {}
ds.models.data = ds.models.data || {}
ds.models.transform = ds.models.transform || {}
ds.edit = ds.edit || {}
ds.edit.properties = ds.edit.properties || {}

/**
 * Return a context object based on the current URL.
 */
ds.context = function(context) {
  context = context || {}
  var url       = new URI(window.location)
  var params    = url.query(true)
  var variables : any = {}

  context.from = params.from || ds.config.DEFAULT_FROM_TIME
  context.until = params.until

  for (var key in params) {
    /* compatibility w/gdash params */
    if (key.indexOf('p[') == 0) {
      var name = key.slice(2, -1)
      variables[name] = params[key]
    } else {
      variables[key] = params[key]
    }
  }

  variables.path = url.path()
  context.path = url.path()
  context.variables = variables
  context.params = params

  return context
}

/**
 * Helper function to (potentially) render a template with a given
 * context object. If the string does not contain any handlebars tags,
 * it will be returned as-is.
 */
ds.render_template = function(str, context) {
  if (str == null) {
    return str
  }
  if (str.indexOf('{{') == -1) {
    return str
  } else {
    var template = Handlebars.compile(str)
    return template(context)
  }
}

ds.safe_render_template = function(str, context) {
  try {
    return ds.render_template(str, context)
  } catch (e) {
    console.log('ds.safe_render_template(): ' + e)
    return str
  }
}

ds.json = function(thing) {
  if (thing.toJSON && typeof(thing.toJSON) === 'function') {
    return thing.toJSON()
  } else {
    return thing
  }
}

ds.uri = function(path) {
  return ds.config.APPLICATION_ROOT
       ? ds.config.APPLICATION_ROOT + path
       : path
}
