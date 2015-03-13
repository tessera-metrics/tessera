/**
 * Create a new performance helper.
 */
ds.perf = function() {

  var separator = '/'

  var self = { }

  if (arguments.length) {
    self.prefix = ''
    for (var i = 0; i < arguments.length; i++) {
      self.prefix += arguments[i] + '/'
    }
  }

  function _munge(name) {
    return self.prefix + name
  }

  self.start = function(name) {
    window.performance.mark(_munge(name) + '_start')
  }

  self.end = function(name) {
    var mark_name = _munge(name)
    window.performance.mark(mark_name + '_end')
    window.performance.measure(mark_name,
                               mark_name + '_start',
                               mark_name + '_end')
    return self.get_last_measure(name)
  }

  self.get_last_measure = function(name) {
    var entries = window.performance.getEntriesByName(_munge(name))
    return entries[entries.length - 1]
  }

  self.get_all_measures = function(name) {
    return window.performance.getEntriesByName(_munge(name))
  }

  self.summarize_measures = function(name) {
    var measures = self.get_all_measures(name)
    return ds.perf.mixin(measures.map(function(measure) {
                           return measure.duration
                         }))
  }

  return self
}

ds.perf.mixin = function(input) {
  var array = ss.mixin(input)
  array.stats = {
    median: array.median(),
    min: array.min(),
    max: array.max(),
    mean: array.mean(),
    sum: array.sum()
  }
  return array
}
