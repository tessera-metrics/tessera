import events from './event'

export default class EventSource {

  constructor(data?: any) {
  }

  on(event: string, handler) : void {
    events.on(this, event, handler)
  }

  off(event: string) : void {
    events.off(this, event)
  }

  fire(event: string, ...data: any[]) : void {
    events.fire(this, event, ...data)
  }
}
