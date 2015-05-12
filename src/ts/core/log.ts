/**
 * Provides a very simple implementation of the age-old log4j logging
 * pattern, supporting only output to `console` for now.
 */

declare var moment

export enum Level {
  OFF, FATAL, ERROR, WARN, INFO, DEBUG, TRACE
}

const default_name        : string   = 'root'
const default_time_format : string   = 'YYYY-MM-DD hh:mm:ss A'
const default_level       : Level = Level.INFO
var   global_level        : Level = default_level

function timestamp() : string {
  return moment().format(default_time_format)
}

/**
 * Options for initializing a new logger.
 */
export interface LoggerOptions {
  name?: string
  level?: Level
}

/**
 * Loggers log logs.
 */
export class Logger {
  name: string
  level: Level = global_level

  constructor(init: string | LoggerOptions) {
    if (typeof init === 'string') {
      this.name = init
    } else {
      this.name = init.name || default_name
      this.level = init.level || default_level
    }
  }

  is_enabled(level: Level) : boolean {
    return level && level >= this.level
  }

  format(level: Level, msg: any) : string {
    var ts         : string = timestamp()
    var level_name : string = Level[level]
    return `${ts} | ${level_name} | ${this.name} | ${msg}`
  }

  log(level: Level, msg: any) : Logger {
    if (this.level >= level) {
      let statement = this.format(level, msg)
      if (level <= Level.WARN) {
        console.error(statement)
      } else {
        console.log(statement)
      }
    }
    return this
  }

  fatal(msg: any) : Logger {
    return this.log(Level.FATAL, msg)
  }

  error(msg: any) : Logger {
    return this.log(Level.ERROR, msg)
  }

  warn(msg: any) : Logger {
    return this.log(Level.WARN, msg)
  }

  info(msg: any) : Logger {
    return this.log(Level.INFO, msg)
  }

  debug(msg: any) : Logger {
    return this.log(Level.DEBUG, msg)
  }

  trace(msg: any) : Logger {
    return this.log(Level.TRACE, msg)
  }
}

/**
 * Provide a typed map for caching loggers by name.
 */
const cache = new Map<string, Logger>()

/**
 * Cached factory function for loggers, which avoids
 * instantiating duplicates with the same name.
 */
export function logger(init: string | LoggerOptions) : Logger {
  let name = typeof init === 'string'
    ? init
    : init.name
  if (!cache.has(name)) {
    cache.set(name, new Logger(init))
  }
  return cache.get(name)
}

/**
 * Set the default global level for new loggers, and change
 * the current logging level of all existing cached loggers.
 */
export function set_level(level: Level) : void {
  global_level = level
  for (let key of cache.keys()) {
    cache.get(key).level = level
  }
}
