import { logger } from './log'

declare var bean
const log = logger('events')

export interface EventHandler {
  (...args:any[]) : void
}

export interface EventProvider {
  on(target: Object, event: string, handler: EventHandler) : void
  off(target: Object, event: string) : void
  fire(target: Object, event: string, ...data: any[]) : void
}

/**
 * A delegating event provider which just logs and forwards all calls
 * to another provider.
 */
class LoggingEventProvider implements EventProvider {
  private provider : EventProvider

  constructor(provider: EventProvider) {
    this.provider = provider
  }

  on(target: Object, event: string, handler: EventHandler) : void {
    log.debug(`on(): ${event}`)
    this.provider.on(target, event, handler)
  }

  off(target: Object, event: string) : void {
    log.debug(`off(): ${event}`)
    this.provider.off(target, event)
  }

  fire(target: Object, event: string, ...data: any[]) : void {
    log.debug(`fire(): ${event}`)
    this.provider.fire(target, event, ...data)
  }
}

/**
 * Event provider that uses bean.js as the underlying event registry
 * and dispatcher.
 *
 * @see https://github.com/fat/bean
 */
class BeanEventProvider implements EventProvider {
  on(target: Object, event: string, handler: EventHandler) : void {
    bean.on(target, event, handler)
  }

  off(target: Object, event: string) : void {
    bean.off(target, event)
  }

  fire(target: Object, event: string, ...data: any[]) : void {
    bean.fire(target, event, ...data)
  }
}

/**
 * Global event provider instance.
 */
var provider : EventProvider

export function set_provider(value: EventProvider) : EventProvider {
  provider = new LoggingEventProvider(value)
  return provider
}

set_provider(new BeanEventProvider())

export default provider
