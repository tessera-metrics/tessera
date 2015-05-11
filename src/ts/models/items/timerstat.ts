import Presentation from './presentation'
import { DashboardItemMetadata } from './item'
import { register_dashboard_item } from './factory'
import { extend } from '../../core/util'
import { PropertyList } from '../../core/property'
import { logger } from '../../core/log'
import Query from '../data/query'

declare var $, d3, humanize_duration, ts

const log = logger('models.timerstat')


const ADDITIONAL_LANGUAGES = {
  minimal: {
    year: function() { return "y"; },
    month: function() { return "mo"; },
    week: function() { return "w"; },
    day: function() { return "d"; },
    hour: function() { return "h"; },
    minute: function() { return "m"; },
    second: function() { return "s"; },
    millisecond: function() { return "ms"; }
  },
  compact: {
    year: function() { return "yr"; },
    month: function() { return "mo"; },
    week: function() { return "wk"; },
    day: function() { return "day"; },
    hour: function() { return "hr"; },
    minute: function() { return "min"; },
    second: function() { return "sec"; },
    millisecond: function() { return "ms"; }
  }
}

const LANGUAGES = [
  undefined,
  'minimal',
  'compact',
].concat(humanize_duration.getSupportedLanguages())

const DEFAULT_HUMANIZER = humanize_duration

const MINIMAL_HUMANIZER = humanize_duration.humanizer({
  language: 'minimal',
  languages: ADDITIONAL_LANGUAGES
})

const COMPACT_HUMANIZER = humanize_duration.humanizer({
  language: 'compact',
  languages: ADDITIONAL_LANGUAGES
})

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
  language: string = undefined
  private humanizer = DEFAULT_HUMANIZER

  constructor(data?: any) {
    super(data)
    if (data) {
      this.transform = data.transform || this.transform
      this.index = Number(data.index) || this.index
      this.scale = Number(data.scale) || this.scale
      this.precision = Number(data.precision) || this.precision
      this.set_language(data.language)
    }
  }

  _updateHumanizer() : void {
    if (this.language) {
      if (this.language === 'compact') {
        this.humanizer = COMPACT_HUMANIZER
      } else {
        this.humanizer = humanize_duration.humanizer({
          language: this.language
        })
      }
    } else {
      this.humanizer = DEFAULT_HUMANIZER
    }
  }

  _getMillis(query: Query) : number {
    let data = this.index
      ? query.data[this.index]
      : query
    return data.summation[this.transform] * this.scale
  }

  _getTimeParts(millis: number) {
    let humanized = this.humanizer(millis, {
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

  set_language(language: string) : Timerstat {
    this.language = language
    this._updateHumanizer()
    return this
  }

  data_handler(query: Query) : void {
    let millis    = this._getMillis(query)
    let timeParts = this._getTimeParts(millis)

    $(`#${this.item_id} .data`)
      .empty()
      .append(ts.templates.models.timerstat_body({parts: timeParts}))
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      language: this.language,
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
      'transform',
      {
        name: 'language', type: 'select',
        edit_options: {
          source: LANGUAGES,
          update: (item, value) => {
            item.set_language(value)
          }
        }
      }
    ])
  }
}
register_dashboard_item(Timerstat)
