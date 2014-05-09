var ds = window.ds || {};
ds.models = ds.models || {};
ds.models.data = ds.models.data || {};
ds.models.transform = ds.models.transform || {};

ds.render_template = function(str, context) {
  if (str == null) {
    return str;
  }
  if (str.indexOf('{{') == -1) {
    return str;
  } else {
    var template = Handlebars.compile(str);
    return template(context);
  }
}

ds.rebind_properties = function(target, source) {
  var i = 1,
      n = arguments.length,
      property;
  while (++i < n) {
    var name = arguments[i];
    ds_rebind_property(target, source, name);
  }
}

function ds_rebind_property(target, source, name) {
  Object.defineProperty(target, name, {
    get: function() {
      return source[name];
    },
    set: function(value) {
      source[name] = value
    }
  });
}
