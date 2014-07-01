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
      if (point[0] && (value < self.min)) {
        self.min = value
      }
    })
    self.mean = self.sum / self.count
  } else if (typeof(initial_data) === 'object') {
    self.sum = initial_data.sum || self.sum
    self.min = initial_data.min || self.min
    self.max = initial_data.max || self.max
    self.first = initial_data.first || self.first
    self.last = initial_data.last || self.last
    self.mean = initial_data.mean || self.mean
    self.count = initial_data.count || self.count
  }

  /**
   * Subtract other from self
   */
  self.subtract = function(other) {
    return ds.models.data.Summation({
      sum:   self.sum   - other.sum,
      min:   self.min   - other.min,
      max:   self.max   - other.max,
      mean:  self.mean  - other.mean,
      first: self.first - other.first,
      last:  self.last  - other.last,
      count: self.count
    })
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
