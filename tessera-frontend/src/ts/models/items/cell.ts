import Container from './container'
import { DashboardItemMetadata } from './item'
import { extend } from '../../core/util'
import { PropertyList } from '../../core/property'

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
    return <Cell> this.updated()
  }

  set_offset(value: number) : Cell {
    this.offset = value
    return <Cell> this.updated()
  }

  set_align(value: string) : Cell {
    this.align = value
    return <Cell> this.updated()
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
      {
        name: 'span',
        edit_options: {
          type: 'select',
          source: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
          ]
        }
      },
      {
        name: 'offset',
        edit_options: {
          type: 'select',
          source: [
            { value: undefined, text: 'none' }, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
          ]
        }
      },
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
