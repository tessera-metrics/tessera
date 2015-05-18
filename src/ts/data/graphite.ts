/**
 * A TypeScript description of the graphite-web JSON data format.
 *
 * @see http://graphite.readthedocs.org/en/latest/render_api.html#data-display-formats
 */

import Summation from '../models/data/summation'

/**
 * Each individual datapoint is a tuple of [value, timestamp].
 */
export type Datapoint = [number, number]

export type DatapointList = Datapoint[]

export interface DataSeries {
  target: string
  datapoints: DatapointList
  summation?: Summation
}

export type DataSeriesList = DataSeries[]

/**
 * Parse Graphite's `raw` data format, which is a more compact
 * on-the-wire representation than JSON.
 *
 * ```
 * Targets are output one per line and are of the format <target
 * name>,<start timestamp>,<end timestamp>,<series step>|[data]*
 * ```
 */
export function parse_raw(raw: string) : DataSeriesList {
  let lines : string[] = raw.split(/\r?\n/)
  return lines.map((line) : DataSeries => {
    return parse_raw_line(line)
  })
}

/**
 * Parse a single line of Graphite's `raw` data format, which
 * represents a single data series.
 */
export function parse_raw_line(line: string) : DataSeries {
  let [meta_string, values_string]  = line.split('|')
  let [target, _start, _end, _step] = meta_string.split(',')
  let start = Number(_start)
  let end   = Number(_end)
  let step  = Number(_step)

  let series : DataSeries = {
    target: target,
    datapoints: []
  }

  let values = values_string.split(',')
  let timestamp = start

  for (let v of values) {
    let value = Number(v)
    if (Number.isNaN(value)) {
      value = null
    }
    series.datapoints.push([value, timestamp])
    timestamp += step
  }

  return series
}
