/**
 * Summarized stats for a data series or set of series. When
 * constructed with a data series, computes the sum, min, max, and
 * mean.
 */
ds.models.data.Summation = function(series) {
  "use strict";

  var storage = {}
    , self = {}

  limivorous.observable(self, storage)
            .property(self, 'sum', storage)
            .property(self, 'min', storage)
            .property(self, 'max', storage)
            .property(self, 'mean', storage)
            .property(self, 'first', storage)
            .property(self, 'last', storage)
            .property(self, 'count', storage)
  Object.defineProperty(self, 'is_summation', {value: true});

  self.sum = self.mean = self.first = self.last = self.count = 0
  self.min = Number.MAX_VALUE
  self.max = Number.MIN_VALUE

  if (series) {
    self.first = series.datapoints[0][0];
    self.count = series.datapoints.length;
    if (self.first == null) {
      self.first = 0;
    }
    series.datapoints.forEach(function(point) {
      var value = point[0] == null ? 0 : point[0];
      self.sum = self.sum + value;
      if (value > self.max) {
        self.max = value;
      }
      if (value < self.min) {
        self.min = value;
      }
      self.last = value;
    });
    self.mean = self.sum / self.count;
  }

  /**
   * Merge another summation into this one. For summarizing
   * queries with multiple data series.
   */
  self.merge = function(other) {
    self.sum += other.sum;
    self.count += other.count;
    self.mean = self.sum / self.count;
    if (other.min < self.min) {
      self.min = other.min;
    }
    if (other.max > self.max) {
      self.max = other.max;
    }
    return self;
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

  return self;
}
