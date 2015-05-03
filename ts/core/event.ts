module ts {

  export const event = {
    log: ts.log.logger('tessera.events'),

    on: function(target: Object, event: string, handler) : void {
      ts.event.log.debug('on(): ' + event)
      bean.on(target, event, handler)
    },

    off: function(target: Object, event: string) : void {
      ts.event.log.debug('off(): ' + event)
      bean.off(target, event)
    },

    fire: function(target: Object, event: string, data?: any) : void {
      ts.event.log.debug('fire(): ' + event)
      bean.fire(target, event, data)
    }

  }
}
