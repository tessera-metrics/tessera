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

  function _mark_name(name) {
    return self.prefix + name
  }

  self.start = function(name) {
    window.performance.mark(_mark_name(name) + '_start')
  }

  self.end = function(name) {
    var mark_name = _mark_name(name)
    window.performance.mark(mark_name + '_end')
    window.performance.measure(mark_name,
                               mark_name + '_start',
                               mark_name + '_end')
    return self.get_measure(name)
  }

  self.get_measure = function(name) {
    var entries = window.performance.getEntriesByName(_mark_name(name))
    return entries[entries.length - 1]
  }

  return self
}
