import Container from './container'
import { DashboardItemMetadata } from './item'
import { extend } from '../../core/util'
import { PropertyList } from '../../core/property'
import { register_dashboard_item } from './factory'

export default class Cell extends Container {
  static meta: DashboardItemMetadata = {
    category:     'structural'
  }

  span: number = 3
  offset: number
  align: string

  constructor(data?: any) {
    super(data)
    if (data) {
      this.span = data.span || this.span
      this.offset = data.offset
      this.align = data.align
    }
  }

  set_span(value: number) : Cell {
    this.span = value
    return this
  }

  set_offset(value: number) : Cell {
    this.offset = value
    return this
  }

  set_align(value: string) : Cell {
    this.align = value
    return this
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      span: this.span,
      offset: this.offset,
      align: this.align
    })
  }

  interactive_properties() : PropertyList {
    return super.interactive_properties().concat([
      'style',
      'css_class',
      { name: 'span', type: 'number' },
      { name: 'offset', type: 'number' },
      {
        name: 'align',
        type: 'select',
        edit_options: {
          source: [
            undefined,
            'left',
            'center',
            'right'
          ]
        }
      }
    ])
  }
}
register_dashboard_item(Cell)
