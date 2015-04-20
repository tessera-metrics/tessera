ds.log = ds.log || {}

ds.log.Level = {
  OFF:   { name: 'OFF',   value: 0 },
  FATAL: { name: 'FATAL', value: 1 },
  ERROR: { name: 'ERROR', value: 2 },
  WARN:  { name: 'WARN ', value: 3 },
  INFO:  { name: 'INFO ', value: 4 },
  DEBUG: { name: 'DEBUG', value: 5 },
  TRACE: { name: 'TRACE', value: 6 }
}

ds.log.default_log_time_format = 'YYYY-MM-DD hh:mm:ss A'

ds.log.default_level = ds.log.Level.INFO

ds.log.cache = {}

ds.log.set_level = function(level) {
  ds.log.default_level = level
  var keys = Object.keys(ds.log.cache)
  for (var i in keys) {
    ds.log.cache[keys[i]].level(level)
  }
}

ds.log.logger = function(options) {

  var self = {}
    , time_format = ds.log.default_log_time_format
    , level = ds.log.default_level
    , name = 'default'

  if (options) {
    if (typeof(options) === 'string') {
      name = options
    } else {
      time_format = options.time_format || time_format
      level       = options.level || level
      name        = options.name || name
    }
  }

  if (ds.log.cache[name]) {
    return ds.log.cache[name]
  }

  function timestamp() {
    return moment().format(time_format)
  }

  function format(msg_level, msg) {
    return timestamp() + ' | ' + msg_level.name + ' | ' + name + ' | ' + msg
  }

  function logger(msg_level) {
    return function(msg) {
      if (level.value >= msg_level.value) {
        console.log(format(msg_level, msg))
      }
      return self
    }
  }

  self.trace = logger(ds.log.Level.TRACE)
  self.debug = logger(ds.log.Level.DEBUG)
  self.info  = logger(ds.log.Level.INFO)
  self.warn  = logger(ds.log.Level.WARN)
  self.error = logger(ds.log.Level.ERROR)
  self.fatal = logger(ds.log.Level.FATAL)

  self.level = function(_) {
    if (arguments.length) {
      level = _
      return self
    }
    return level
  }

  self.is_enabled = function(log_level) {
    return log_level && level.value >= log_level.value
  }

  self.name = function() {
    return name
  }

  self.time_format = function(_) {
    if (arguments.level) {
      time_format = _
      return self
    }
    return time_format
  }

  ds.log.cache[name] = self

  return self
}
