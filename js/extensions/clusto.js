/**
 * Urban Airship template extensions for retrieving data from UA's
 * clusto extension API, and formatting graphite metrics specific to
 * UA's services.
 */

var ua = window.ua || {}

ua.clusto =
  (function() {

    var cache = {}
      , cache_data = {}
      , BASE_URL = 'http://clusto.prod.urbanairship.com:9998'
      , self = {}

    Object.defineProperty(self, 'cache', {get: function() { return cache }})

    cache.key = function(role) {
      return 'ua.clusto/' + role
    }

    cache.keys = function() {
      return Object.keys(cache_data)
    }

    cache.getItem = function(role) {
      var key = cache.key(role)
      if (cache_data[key]) {
        console.log('Cache hit (immediate) for ' + role)
        return cache_data[key]
      } else if (localStorage[key]) {
        console.log('Cache hit (localStorage) for ' + role)
        var data = localStorage[key]
        cache[key] = data
        return data
      }
      console.log('Cache miss for ' + role)
      return null
    }

    cache.putItem = function(role, data) {
      var key = cache.key(role)
      cache_data[key] = data
      localStorage[key] = data
      return data
    }

    cache.clear = function(_) {
      var clearLocal = true
      if (arguments.length > 0)
        clearLocal = arguments[0]
      if (clearLocal) {
        console.log("Clearing localStorage")
        var localKeys = Object.keys(localStorage)
        for (var i in localKeys) {
          var key = localKeys[i]
          if (key.search('ua.clusto') == 0) {
            console.log("Clearing " + key + " from localStorage");
            localStorage.removeItem(key)
          }
        }
      }
      cache_data = {}
    }


    self.get_role = function(role) {
      var data = cache.getItem(role)
      if (data) {
        return data
      } else {
        var url = BASE_URL + '/ua/search/prod,' + role + '.json'
        var result = ''
        $.ajax({
          url: url,
          type: 'GET',
          async: false,
          success: function(data) {
            if (!data || (data.length == 0)) {
              result = role
            } else {
              result = data.join(',')
            }
          },
          error: function() {
            ds.manager.error('Unable to retrieve role ' + role + ' from clusto')
            return null
          }
        })
        return cache.putItem(role, result)
      }
    }

    return self
})()


/**
 * A helper which returns a graphite metric expression for a set of
 * hostnames, from a role or service literal (i.e. {{clusto
 * 'notices-worker'}})
 */
Handlebars.registerHelper('clusto', function(role) {
  return '{' + ua.clusto.get_role(role) + '}'
})

/**
 * A helper which returns a graphite metric expression for a set of
 * hostnames for a role or service, with the name of the role or
 * service extracted from a URL query parameter on the current page
 * (i.e. {{clusto 'role'}} will retrieve the role name from the
 * ?role=XXX query string).
 */
Handlebars.registerHelper('clusto-query', function(query) {
  var role = URI(window.location).query(true)[query]
  return '{' + ua.clusto.get_role(role) + '}'
})

/**
 * A helper which returns a metric prefix for an Urban Airship Java
 * service, with hostnames retrieved from clusto.
 *
 * Example:
 *   {{ua-service "triggers-state-ingress"}}.observationstreamconsumer.historical_triggers_processed.Count
 *
 * will expand to:
 *   servers.{host1,host2}.rash.triggers-state-ingress.observationstreamconsumer.historical_triggers_processed.Count
 */
Handlebars.registerHelper('ua-service', function(service_name) {
  return 'servers.{' + ua.clusto.get_role(service_name) + '}.rash.' + service_name
})
