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

    /**
     * Return the cache key for a role.
     */
    cache.key = function(role) {
      return 'ua.clusto/' + role
    }

    /**
     * List all the keys in the immediate cache.
     */
    cache.keys = function() {
      return Object.keys(cache_data)
    }

    /**
     * Retrieve an item from the cache. Checks the in-memory cache
     * first, falling back to browser-local storage.
     */
    cache.getItem = function(role) {
      var key = cache.key(role)
      if (cache_data[key]) {
        return cache_data[key]
      } else if (localStorage[key]) {
        var data = localStorage[key]
        cache[key] = data
        return data
      }
      return null
    }

    /**
     * Store an item in the cache, in both the transient in-memory
     * cache and the browser-local storage.
     */
    cache.putItem = function(role, data) {
      var key = cache.key(role)
      cache_data[key] = data
      localStorage[key] = data
      return data
    }

    /**
     * Clear the cache. This defaults to clearing the browser-local
     * storage as well as the transient cache. Passing false as the
     * first argument will retain the local storage cache.
     */
    cache.clear = function(_) {
      var clearLocal = true
      if (arguments.length > 0)
        clearLocal = arguments[0]
      if (clearLocal) {
        var localKeys = Object.keys(localStorage)
<<<<<<< HEAD
        for (var i in localKeys) {
=======
        for (var i = 0; i < localKeys.length; i++) {
>>>>>>> c141c31aaf681904e34cd372e1d7abe46b15a76f
          var key = localKeys[i]
          if (key.search('ua.clusto') == 0) {
            localStorage.removeItem(key)
          }
        }
      }
      cache_data = {}
    }

    /**
     * Return an array of the hostnames for a given role or service
     * name. Returns null if the role or service cannot be found.
     */
    self.get_role = function(role) {
      var data = cache.getItem(role)
      if (typeof(data) === 'string') {
        cache.clear(cache.key(role))
        data = null
      }
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
<<<<<<< HEAD
              result = [ role ]
=======
              result = []
>>>>>>> c141c31aaf681904e34cd372e1d7abe46b15a76f
            } else {
              result = data
            }
          },
          error: function() {
<<<<<<< HEAD
            ds.manager.warning('Unable to retrieve role ' + role + ' from clusto')
            return [ role ]
=======
            ds.manager.error('Unable to retrieve role ' + role + ' from clusto')
            return null
>>>>>>> c141c31aaf681904e34cd372e1d7abe46b15a76f
          }
        })
        return cache.putItem(role, result)
      }
    }

    self.block_helper = function(role, options) {
      var nodes = ua.clusto.get_role(role)
      /* If called as a block template */
      if (options && options.fn) {
        var out = ''
<<<<<<< HEAD
        for (var i in nodes) {
=======
        for (var i = 0; i < nodes.length; i++) {
>>>>>>> c141c31aaf681904e34cd372e1d7abe46b15a76f
          out = out + options.fn(nodes[i])
        }
        return out
      } else { /* else just a single template */
        return '{' + nodes.join(',') + '}'
      }
    }

    return self
})()


/**
 * A helper which returns a graphite metric expression for a set of
 * hostnames, from a role or service literal (i.e. {{clusto
 * 'notices-worker'}}) when called as a single template tag.
 *
 * Can also be used as a block template, in which case the body is
 * called once for each hostname in the returned set.
 */
Handlebars.registerHelper('clusto', function(role, options) {
  return ua.clusto.block_helper(role, options)
})

/**
 * A helper which returns a graphite metric expression for a set of
 * hostnames for a role or service, with the name of the role or
 * service extracted from a URL query parameter on the current page
 * (i.e. {{clusto 'role'}} will retrieve the role name from the
 * ?role=XXX query string).
 */
Handlebars.registerHelper('clusto-query', function(query, options) {
  var role = URI(window.location).query(true)[query]
  return ua.clusto.block_helper(role, options)
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
  return 'servers.{' + ua.clusto.get_role(service_name).join(',') + '}.rash.' + service_name
})
