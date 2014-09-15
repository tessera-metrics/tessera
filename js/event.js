ds.event =
  (function() {

    var self = {}
      , log = ds.log.logger('tessera.events')

    self.on = function(target, event, handler) {
      log.debug('on(): ' + event)
      bean.on(target, event, handler)
    }

    self.off = function(target, event) {
      log.debug('off(): ' + event)
      bean.off(target, event)
    }

    self.fire = function(target, event, data) {
      log.debug('fire(): ' + event)
      bean.fire(target, event, data)
    }

    return self

  })()
