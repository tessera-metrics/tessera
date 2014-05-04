ds.models.transform.transform = function(data) {
  var transform_name
    , transform_type
    , parent
    , self = {};

  if (data) {
    transform_name = data.transform_name;
    transform_type = transform_type;
  }

  Object.defineProperty(self, 'transform_name', {get: function() { return transform_name; }});
  Object.defineProperty(self, 'transform_type', {get: function() { return transform_type; }});

  self.rebind = function(target) {
    parent = target;
    ds.rebind_properties(target, self, 'transform_name', 'transform_type');
    Object.defineProperty(target, '_transform', {value: self});
    Object.defineProperty(target, 'is_transform', {value: true});
    return self;
  }

  self.set_transform_name = function(_) {
    transform_name = _;
    return self;
  }

  self.set_transform_type = function(_) {
    transform_type = _;
    return self;
  }

  self.toJSON = function(data_) {
    var data = data_ || {};
    data.transform_name = transform_name;
    data.transform_type = transform_type;
    return data;
  }

  return self;
}
