var ds : any = window['ds'] || {}

module ts {
  export interface TemplateFunction {
    (ctx?: any) : string
  }

  /**
   * Return a context object based on the current URL.
   */
  export function context(context?: any) : any {
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
  export function render_template(str: string, context?: any) : string {
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

  export function safe_render_template(str: string, context?: any) : string {
    try {
      return ts.render_template(str, context)
    } catch (e) {
      console.log('ts.safe_render_template(): ' + e)
      return str
    }
  }

  export function json(thing: any) : any {
    if (thing.toJSON && typeof(thing.toJSON) === 'function') {
      return thing.toJSON()
    } else {
      return thing
    }
  }

  export function uri(path: string) : string {
    return ds.config.APPLICATION_ROOT
      ? ds.config.APPLICATION_ROOT + path
      : path
  }
}
