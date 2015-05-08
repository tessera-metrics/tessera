export default class Config {

  PROPSHEET_AUTOCLOSE_SECONDS: number = 3
  APPLICATION_ROOT: string = null
  DEFAULT_FROM_TIME: string = '-3h'
  DISPLAY_TIMEZONE: string = 'Etc/UTC'
  GRAPHITE_AUTH: string = null
  GRAPHITE_URL: string = 'http://localhost:8080'

  constructor(data?: any) {
    if (data) {
      this.PROPSHEET_AUTOCLOSE_SECONDS = data.PROPSHEET_AUTOCLOSE_SECONDS || this.PROPSHEET_AUTOCLOSE_SECONDS
      this.APPLICATION_ROOT = data.APPLICATION_ROOT
      this.DEFAULT_FROM_TIME = data.DEFAULT_FROM_TIME || this.DEFAULT_FROM_TIME
      this.DISPLAY_TIMEZONE = data.DISPLAY_TIMEZONE || this.DISPLAY_TIMEZONE
      this.GRAPHITE_AUTH = data.GRAPHITE_AUTH
      this.GRAPHITE_URL = data.GRAPHITE_URL || this.GRAPHITE_URL
    }
  }
}
