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
                       .property('min_index')
                       .property('max', { init: Number.MIN_VALUE })
                       .property('max_index')
                       .property('mean', { init: 0 })
                       .property('median', { init: 0 })
                       .property('first', { init: 0 })
                       .property('last', { init: 0 })
                       .property('count', { init: 0 })
                       .build()
  Object.defineProperty(self, 'is_summation', {value: true})

  function if_defined(value, default_value) {
    return typeof(value) === 'undefined'
         ? default_value
         : value
  }

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
      for (var n = 0; n < initial_data.length; n++) {
        /* ignore input series which are smaller than the first series */
        if(typeof(initial_data[n].datapoints[i]) !== 'undefined') {
          x += initial_data[n].datapoints[i][0]
        }
      }
      datapoints.push([x, initial_data[0].datapoints[i][1]])
    }
  } else if (initial_data && initial_data.datapoints) {
    datapoints = initial_data.datapoints
  }

  if (datapoints && datapoints.length) {
    /* add simple-statistics methods */
    var values = ss.mixin(datapoints.map(function(point) {
                            return point[0]
                          }))
    self.median = values.median()
    self.first = datapoints[0][0]
    self.count = datapoints.length
    if (self.first == null) {
      self.first = 0
    }
    var index = 0
    datapoints.forEach(function(point) {
      var value = point[0] || 0
      self.last = value
      self.sum = self.sum + value
      if (value > self.max) {
        self.max = value
        self.max_index = index
      }
      if (point[0] && (value < self.min)) {
        self.min = value
        self.min_index = index
      }
      index++
    })
    if (self.sum === 0) {
      self.min = 0
      self.max = 0
    }
    self.mean = self.sum / self.count
  } else if (typeof(initial_data) === 'object') {
    self.sum   = if_defined(initial_data.sum,  self.sum)
    self.min   = if_defined(initial_data.min, self.min)
    self.min_index = if_defined(initial_data.min, self.min_index)
    self.max   = if_defined(initial_data.max, self.max)
    self.max_index = if_defined(initial_data.max, self.max_index)
    self.first = if_defined(initial_data.first, self.first)
    self.last  = if_defined(initial_data.last, self.last)
    self.mean  = if_defined(initial_data.mean, self.mean)
    self.mean  = if_defined(initial_data.median, self.median)
    self.count = if_defined(initial_data.count, self.count)
  }

  /**
   * Subtract other from self
   */
  self.subtract = function(other) {
    return ds.models.data.Summation({
      sum:    self.sum    - other.sum,
      min:    self.min    - other.min,
      max:    self.max    - other.max,
      mean:   self.mean   - other.mean,
      median: self.median - other.median,
      first:  self.first  - other.first,
      last:   self.last   - other.last,
      count:  self.count
    })
  }

  self.toJSON = function() {
    return {
      sum: self.sum,
      min: self.min,
      min_index: self.min_index,
      max: self.max,
      max_index: self.max_index,
      mean: self.mean,
      median: self.median,
      first: self.first,
      last: self.last,
      count: self.count
    }
  }

  return self
}
