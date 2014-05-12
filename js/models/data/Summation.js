/**
 * Summarized stats for a data series or set of series. When
 * constructed with a data series, computes the sum, min, max, and
 * mean.
 */
ds.models.data.Summation = function(series) {
  "use strict"

  var self = limivorous.observable()
                       .property('sum', { init: 0 })
                       .property('min', { init: Number.MAX_VALUE })
                       .property('max', { init: Number.MIN_VALUE })
                       .property('mean', { init: 0 })
                       .property('first', { init: 0 })
                       .property('last', { init: 0 })
                       .property('count', { init: 0 })
                       .build()
  Object.defineProperty(self, 'is_summation', {value: true})

  if (series) {
    self.first = series.datapoints[0][0]
    self.count = series.datapoints.length
    if (self.first == null) {
      self.first = 0
    }
    series.datapoints.forEach(function(point) {
      var value = point[0] == null ? 0 : point[0]
      self.sum = self.sum + value
      if (value > self.max) {
        self.max = value
      }
      if (value < self.min) {
        self.min = value
      }
      self.last = value
    })
    self.mean = self.sum / self.count
  }

  /**
   * Merge another summation into this one. For summarizing
   * queries with multiple data series.
   */
  self.merge = function(other) {
    self.sum += other.sum
    self.count += other.count
    self.mean = self.sum / self.count
    if (other.min < self.min) {
      self.min = other.min
    }
    if (other.max > self.max) {
      self.max = other.max
    }
    return self
  }

  self.toJSON = function() {
    return {
      sum: self.sum,
      min: self.min,
      max: self.max,
      mean: self.mean,
      first: self.first,
      last: self.last,
      count: self.count
    }
  }

  return self
}
