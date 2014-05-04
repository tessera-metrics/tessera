ds.models.layout.layout = function(data) {
  var layout_name
    , layout_type
    , parent
    , self = {};

  if (data) {
    layout_name = data.layout_name;
    layout_type = layout_type;
  }

  Object.defineProperty(self, 'layout_name', {get: function() { return layout_name; }});
  Object.defineProperty(self, 'layout_type', {get: function() { return layout_type; }});

  self.rebind = function(target) {
    parent = target;
    ds.rebind_properties(target, self, 'layout_name', 'layout_type');
    Object.defineProperty(target, '_layout', {value: self});
    Object.defineProperty(target, 'is_layout', {value: true});
    return self;
  }

  self.set_layout_name = function(_) {
    layout_name = _;
    return self;
  }

  self.set_layout_type = function(_) {
    layout_type = _;
    return self;
  }

  self.toJSON = function(data_) {
    var data = data_ || {};
    data.layout_name = layout_name;
    data.layout_type = layout_type;
    return data;
  }

  return self;
}
