import Container from './container'
import { DashboardItemMetadata } from './item'
import { PropertyList } from '../../core/property'
import { register_dashboard_item } from './factory'

export default class Row extends Container {
  static meta: DashboardItemMetadata = {
    category: 'structural'
  }

  constructor(data?: any) {
    super(data)
  }

  interactive_properties() : PropertyList {
    return [
      'style', 'css_class'
    ]
  }
}
register_dashboard_item(Row)
