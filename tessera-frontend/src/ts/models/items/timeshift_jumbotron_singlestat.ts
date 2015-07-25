import TimeshiftSinglestat from './timeshift_singlestat'

declare var ts

export default class TimeshiftJumbotronSinglestat extends TimeshiftSinglestat {
  static meta = {
    template: ts.templates.models.jumbotron_singlestat
  }
}
