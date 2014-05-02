ds.models.query = function(data) {
  "use strict";

  var targets = []
    , name
    , self = {};

  if (data) {
    if (data.targets) {
      if (data.targets instanceof Array) {
        targets = data.targets;
      } else {
        targets = [data.targets];
      }
    }
    name = data.name;
  }

  self.DEFAULT_FROM_TIME = '-3h';

  Object.defineProperty(self, 'targets', {get: function() { return targets; }});
  Object.defineProperty(self, 'name', {get: function() { return name; }});

  /**
   * Render a URL to fetch this query from Graphite.
   *
   * @param {Object} options Parameters for generating the URL. Valid
   * properties are:
   *   * base_url (required)
   *   * format (defaults to 'png')
   *   * from
   *   * until
   */
  self.render_url = function(options) {
    // TODO: error if base_url is missing
    var url = URI(options.base_url)
              .path('/render')
              .setQuery('format', options.format || 'png')
              .setQuery('from', options.from || self.DEFAULT_FROM_TIME);
    if (options.until) {
      url.setQuery('until', options.until);
    }
    for (var i in targets) {
      url.addQuery('target', targets[i]);
    }
    console.log("render_url: " + url.href());
    return url.href();
  }

  /**
   * Data mutators
   */

  self.set_targets = function(_) {
    targets = _;
    return self;
  }

  self.set_name = function(_) {
    name = _;
    return self;
  }

  self.toJSON = function() {
    return {
      name: name,
      targets: targets
    }
  }

  return self;
}
