import DashboardItem, { DashboardItemMetadata } from './item'
import { render_template } from '../../core/template'
import { PropertyList } from '../../core/property'
import { extend } from '../../core/util'

export default class Markdown extends DashboardItem {
  static meta: DashboardItemMetadata = {
    icon: 'fa fa-code',
    category: 'display'
  }

  text: string
  expanded_text: string
  raw: boolean = false

  constructor(data?: any) {
    super(data)
    if (data) {
      this.text = data.text
      if (data.raw !== undefined) {
        this.raw = data.raw
      }
    }
  }

  render_templates(context?: any) : void {
    try {
      this.expanded_text = render_template(this.text, context)
    } catch (e) {
      this.expanded_text = e.toString()
    }
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      text: this.text,
      raw: this.raw
    })
  }

  interactive_properties(): PropertyList {
    return [
      {
        name: 'markdown.text',
        type: 'textarea',
        property_name: 'text'
      },
      'css_class'
    ]
  }
}
