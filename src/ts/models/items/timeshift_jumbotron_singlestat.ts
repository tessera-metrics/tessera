import TimeshiftSinglestat from './timeshift_singlestat'
import { register_dashboard_item } from './factory'

declare var ts

export default class TimeshiftJumbotronSinglestat extends TimeshiftSinglestat {
  static meta = {
    template: ts.templates.models.jumbotron_singlestat
  }
}
register_dashboard_item(TimeshiftJumbotronSinglestat)
