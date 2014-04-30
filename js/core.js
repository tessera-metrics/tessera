var ds = window.ds || {};
ds.models = ds.models || {};

/**
 * Copied from d3.js, because it's very useful with this style of
 * modelling.
 */

// Copies a variable number of methods from source to target.
ds.rebind = function(target, source) {
  var i = 1, n = arguments.length, method;
  while (++i < n) target[method = arguments[i]] = ds_rebind(target, source, source[method]);
  return target;
};

// Method is assumed to be a standard DS getter-setter:
// If passed with no arguments, gets the value.
// If passed with arguments, sets the value and returns the target.
function ds_rebind(target, source, method) {
  return function() {
    var value = method.apply(source, arguments);
    return value === source ? target : value;
  };
}
