import Container from './container'
import { DashboardItemMetadata } from './item'
import { PropertyList } from '../../core/property'

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
