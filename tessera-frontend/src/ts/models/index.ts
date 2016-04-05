export { default as Model } from './model'
export { AxisScale, default as Axis } from './axis'
export { default as Thresholds } from './thresholds'
export { default as Tag } from './tag'
export { default as Dashboard, DashboardTuple } from './dashboard'

export { default as Query } from './data/query'
export { default as Summation } from './data/summation'
export { default as Preferences } from './preferences'

export * from './items'

export interface DashboardCategory {
  name: string
  count: number
}
