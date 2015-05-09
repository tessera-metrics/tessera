import Singlestat from './singlestat'
import { register_dashboard_item } from './factory'

export default class JumbotronSinglestat extends Singlestat {
  constructor(data?: any) {
    super(data)
  }
}
register_dashboard_item(JumbotronSinglestat)
