/**
 * Summarized stats for a data series or set of series. When
 * constructed with a data series, computes the sum, min, max, and
 * mean.
 */
ds.models.data.Summation = function(series) {
  "use strict";

  var series
    , sum
    , min = Number.MAX_VALUE
    , max = Number.MIN_VALUE
    , mean
    , first
    , last
    , count
    , self = {};

  if (series) {
    first = series.datapoints[0][0];
    count = series.datapoints.length;
    if (first == null) {
      first = 0;
    }
    series.datapoints.forEach(function(point) {
      var value = point[0] == null ? 0 : point[0];
      sum = sum + value;
      if (value > max) {
        max = value;
      }
      if (value < min) {
        min = value;
      }
      last = value;
    });
    mean = sum / count;
  }

  Object.defineProperty(self, 'series', {get: function() { return series; }});
  Object.defineProperty(self, 'sum', {get: function() { return sum; }});
  Object.defineProperty(self, 'min', {get: function() { return min; }});
  Object.defineProperty(self, 'max', {get: function() { return max; }});
  Object.defineProperty(self, 'mean', {get: function() { return mean; }});
  Object.defineProperty(self, 'first', {get: function() { return first; }});
  Object.defineProperty(self, 'last', {get: function() { return last; }});
  Object.defineProperty(self, 'count', {get: function() { return count; }});

  /**
   * Merge another summation into this one. For summarizing
   * queries with multiple data series.
   */
  self.merge = function(other) {
    sum += other.sum;
    count += other.count;
    mean = sum / count;
    if (other.min < min) {
      min = other.min;
    }
    if (other.max > max) {
      max = other.max;
    }
    return self;
  }

  self.toJSON = function() {
    return {
      series: series,
      sum: sum,
      min: min,
      max: max,
      mean: mean,
      first: first,
      last: last,
      count: count
    }
  }

  return self;
}
