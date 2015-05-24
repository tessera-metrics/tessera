import Model from './model'

export default class Preferences extends Model {
  connected_lines: boolean = false
  default_from_time: string = '-3h'
  downsample: boolean = true
  graphite_auth: string
  graphite_url: string = 'http://locahost:8080'
  propsheet_autoclose_seconds: number = 3
  refresh: number = 60
  renderer: string = 'flot'
  theme: string = 'light'
  timezone: string = 'Etc/UTC'

  constructor(data?: any) {
    super(data)
    if (data) {
      if (typeof data.connected_lines != 'undefined')
        this.connected_lines = !!data.connected_lines
      this.default_from_time = data.default_from_time || this.default_from_time
      if (typeof data.downsample != 'undefined')
        this.downsample = !!data.downsample
      this.graphite_auth = data.graphite_auth
      this.graphite_url = data.graphite_url || this.graphite_url
      this.propsheet_autoclose_seconds = Number(data.propsheet_autoclose_seconds) || this.propsheet_autoclose_seconds
      this.refresh = Number(data.refresh) || this.refresh
      this.renderer = data.renderer || this.renderer
      this.theme = data.theme || this.theme
      this.timezone = data.timezone || this.timezone
    }
  }

  toJSON() : any {
    return {
      connected_lines: this.connected_lines,
      default_from_time: this.default_from_time,
      downsample: this.downsample,
      graphite_auth: this.graphite_auth,
      graphite_url: this.graphite_url,
      propsheet_autoclose_seconds: this.propsheet_autoclose_seconds,
      refresh: this.refresh,
      renderer: this.renderer,
      theme: this.theme,
      timezone: this.timezone
    }
  }
}
