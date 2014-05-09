var clusto = window.clusto || {}

clusto.cache = {}

clusto.get_role = function(role) {
  if (clusto.cache[role]) {
    return clusto.cache[role]
  } else {
    var url = 'http://clusto.prod.urbanairship.com:9998/ua/search/prod,' + role + '.json'
    var result = ''
    $.ajax({
      url: url,
      type: 'GET',
      async: false,
      success: function(data) {
        result = data.join(',')
      },
      error: function() {
        ds.manager.error('Unable to retrieve role ' + role + ' from clusto')
      }
    })
    clusto.cache[role] = result
    return result
  }
}

Handlebars.registerHelper('clusto', function(role) {
  return '{' + clusto.get_role(role) + '}'
})

Handlebars.registerHelper('clusto-query', function(query) {
  var role = URI(window.location).query(true)[query]
  return '{' + clusto.get_role(role) + '}'
})
