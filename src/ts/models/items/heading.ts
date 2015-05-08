import DashboardItem, { DashboardItemMetadata } from './item'
import { extend } from '../../core/util'
import { PropertyList } from '../../core/property'
import { register_dashboard_item } from './factory'

export default class Heading extends DashboardItem {
  static meta: DashboardItemMetadata = {
    icon: 'fa fa-header',
    category: 'display'
  }

  text: string
  level: number = 1
  description: string

  constructor(data?: any) {
    super(data)
    if (data) {
      this.text = data.text
      this.level = data.level || this.level
      this.description = data.description
    }
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      text: this.text,
      level: this.level,
      description: this.description
    })
  }

  interactive_properties() : PropertyList {
    return [
      'text',
      { name: 'level', type: 'number' },
      'description'
    ]
  }
}
register_dashboard_item(Heading)
