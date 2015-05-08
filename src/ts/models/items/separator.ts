import DashboardItem, { DashboardItemMetadata } from './item'
import { PropertyList } from '../../core/property'
import { register_dashboard_item } from './factory'

export default class Separator extends DashboardItem {
  static meta: DashboardItemMetadata = {
    item_type: 'separator',
    display_name: 'Separator',
    icon: 'fa fa-arrows-h',
    category: 'display'
  }

  constructor(data?: any) {
    super(data)
  }

  interactive_properties() : PropertyList {
    return [ 'css_class' ]
  }
}
register_dashboard_item(Separator)
