import Container from './container'
import { DashboardItemMetadata } from './item'
import { extend } from '../../core/util'
import { PropertyList } from '../../core/property'

export default class Section extends Container {
  static meta: DashboardItemMetadata = {
    category: 'structural'
  }

  description: string
  level: number = 1
  horizontal_rule: boolean = false
  layout: string = 'fixed'

  constructor(data?: any) {
    super(data)
    if (data) {
      this.description = data.description
      this.level = data.level || this.level
      if (typeof data.horizontal_rule !== 'undefined')
        this.horizontal_rule = !!data.horizontal_rule
      this.layout = data.layout || this.layout
    }
  }

  set_layout(value: string) : Section {
    this.layout = value
    return <Section> this.updated()
  }

  toJSON() :any {
    return extend(super.toJSON(), {
      description: this.description,
      level: this.level,
      horizontal_rule: this.horizontal_rule,
      layout: this.layout
    })
  }

  interactive_properties(): PropertyList {
    return [
      { name: 'layout',
        type: 'select',
        edit_options: {
          source: [
            'fixed',
            'fluid',
            'none'
          ]
        }
      },
      'style',
      'css_class',
      'title',
      'description',
      {
        name: 'level',
        edit_options: {
          type: 'select',
          source: [ 1, 2, 3, 4, 5, 6 ]
        }
      },
      { name: 'horizontal_rule', type: 'boolean' }
    ]
  }
}
