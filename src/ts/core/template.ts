import { logger } from './log'
declare var Handlebars

const log = logger('template')

export interface TemplateFunction {
  (ctx?: any) : string
}

export function compile_template(tmpl: string|TemplateFunction) : TemplateFunction {
  if (typeof tmpl === 'string') {
    return Handlebars.compile(tmpl)
  } else {
    return tmpl
  }
}

export function render_template(tmpl: string|TemplateFunction, context?: any) : string {
  if (tmpl == null) {
    return ''
  }
  if (typeof tmpl === 'string') {
    if (tmpl.indexOf('{{') == -1) {
      return tmpl
    } else {
      return Handlebars.compile(tmpl)(context)
    }
  } else {
    return tmpl(context)
  }
}

export function safe_render_template(tmpl: string|TemplateFunction, context?: any) : string {
  try {
    return render_template(tmpl, context)
  } catch (e) {
    log.error('safe_render_template(): ' + e)
    if (typeof tmpl === 'string') {
      return tmpl
    } else {
      return ''
    }
  }
}

export default class Template {
  tmpl: TemplateFunction

  constructor(tmpl: string|TemplateFunction) {
    this.tmpl = compile_template(tmpl)
  }

  render(context?: any) : string {
    return safe_render_template(this.tmpl, context)
  }
}
