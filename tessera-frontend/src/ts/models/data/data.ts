/**
 * A generic interface for concrete time series data. For now, this is
 * just copied over from the Graphite type definitions for expediency.
 */
import Summation from './summation'

/** An individual data point is a tuple of [value, timestamp] */
export type Datapoint = [number, number]

export type DatapointList = Datapoint[]

export interface DataSeries {
  target: string
  datapoints: DatapointList
  summation?: Summation
}

export type DataSeriesList = DataSeries[]
