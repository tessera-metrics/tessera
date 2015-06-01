import ComparisonSinglestat from './comparison_singlestat'

declare var ts

export default class ComparisonJumbotronSinglestat extends ComparisonSinglestat {
  static meta = {
    template: ts.templates.models.jumbotron_singlestat
  }
}
