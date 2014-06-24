/**
 * Summarized stats for a data series or set of series. When
 * constructed with a data series, computes the sum, min, max, and
 * mean.
 *
 * The input format is assumed to be the JSON representation returned
 * by graphite-web.
 */
ds.models.data.Summation = function(initial_data) {
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

  /**
   * Initialize the summation
   */
  var datapoints = []

  if (initial_data && (initial_data instanceof Array) && (initial_data.length)) {
    /* This assumes that all input series have the same number of data points */
    var length = initial_data[0].datapoints.length
    var summed_datapoints = []
    for (var i = 0; i < length; i++) {
      var x = 0
      for (var n in initial_data) {
        x += initial_data[n].datapoints[i][0]
      }
      datapoints.push([x, initial_data[0].datapoints[i][1]])
    }
  } else if (initial_data && initial_data.datapoints) {
    datapoints = initial_data.datapoints
  }

  if (datapoints && datapoints.length) {
    self.first = datapoints[0][0]
    self.count = datapoints.length
    if (self.first == null) {
      self.first = 0
    }
    datapoints.forEach(function(point) {
      var value = point[0] || 0
      self.last = value
      self.sum = self.sum + value
      if (value > self.max) {
        self.max = value
      }
      if (value < self.min) {
        self.min = value
      }
    })
    self.mean = self.sum / self.count
  }

  /**
   * Merge another summation into this one. For summarizing
   * queries with multiple data series.
   */
  self.merge = function(other) {
    self.sum += other.sum || 0
    self.count = other.count /* assuming series are from the same query */
    self.mean = self.sum / self.count

    if (other.min < self.min) {
      self.min = other.min
    }
    if (other.max > self.max) {
      self.max = other.max
    }

    self.first += other.first || 0
    self.last += other.last || 0
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
