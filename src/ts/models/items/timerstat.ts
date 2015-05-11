import Presentation from './presentation'
import { DashboardItemMetadata } from './item'
import { register_dashboard_item } from './factory'
import { extend } from '../../core/util'
import { PropertyList } from '../../core/property'
import { logger } from '../../core/log'
import Query from '../data/query'

declare var $, d3, humanize_duration, ts

const log = logger('models.timerstat')

/**
 * Render a summation value as a human-readable time span.
 *
 * TODO:
 * - This brings up the fact that we should now add a language user
 *   preference/global setting, similar to time zone.
 * - Expose more of the options from HumanizeDuration
 *
 * @see https://github.com/EvanHahn/HumanizeDuration.js
 */
export default class Timerstat extends Presentation {
  static meta: DashboardItemMetadata = {
    display_name: 'Timer Stat',
    category: 'data-table',
    icon: 'fa fa-clock-o',
    requires_data: true
  }

  transform: string = 'mean'
  index: number
  scale: number = 1
  precision: number = 2

  constructor(data?: any) {
    super(data)
    if (data) {
      this.transform = data.transform || this.transform
      this.index = Number(data.index) || this.index
      this.scale = Number(data.scale) || this.scale
      this.precision = Number(data.precision) || this.precision
    }
  }

  _getMillis(query: Query) : number {
    let data = this.index
      ? query.data[this.index]
      : query
    return data.summation[this.transform] * this.scale
  }

  _getTimeParts(millis: number) {
    let humanized = humanize_duration(millis, {
      round: true,
      delimiter: ' '
    })
    let tokens = humanized.split(' ')
      .slice(0, this.precision * 2)

    let timeParts = []
    for (var i = 0; i < tokens.length; i += 2) {
      timeParts.push({
        value: tokens[i],
        unit: tokens[i + 1]
      })
    }
    return timeParts
  }

  data_handler(query: Query) : void {
    log.info('data_handler()')
    let millis    = this._getMillis(query)
    let timeParts = this._getTimeParts(millis)

    log.info(`millis = ${millis}`)
    console.log(timeParts)

    $(`#${this.item_id} .data`)
      .empty()
      .append(ts.templates.models.timerstat_body({parts: timeParts}))
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      transform: this.transform,
      index: this.index,
      scale: this.scale,
      precision: this.precision
    })
  }

  interactive_properties() : PropertyList {
    return super.interactive_properties().concat([
      'title',
      { name: 'index', type: 'number' },
      'scale',
      { name: 'precision', type: 'number' },
      'transform'
    ])
  }
}
register_dashboard_item(Timerstat)
