import ComparisonSinglestat from './comparison_singlestat'
import { register_dashboard_item } from './factory'

declare var ts

export default class ComparisonJumbotronSinglestat extends ComparisonSinglestat {
  static meta = {
    template: ts.templates.models.jumbotron_singlestat
  }
}
register_dashboard_item(ComparisonJumbotronSinglestat)
