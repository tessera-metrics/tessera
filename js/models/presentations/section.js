ds.models.section = function(data) {
  "use strict";

  var layout = 'fixed'
    , container
    , base
    , self = {};

  if (data) {
    layout = data.layout || layout;
  }
  base = ds.models.item(data).set_type('section').rebind(self);
  container = ds.models.container(data).rebind(self);

  Object.defineProperty(self, 'layout', {get: function() { return layout; }});

  /**
   * Operations
   */

  self.visit = function(visitor) {
    container.visit(visitor);
    return self;
  }

  /**
   * Data accessors
   */

  self.set_layout = function(_) {
    layout = _;
    return self;
  }

  self.toJSON = function() {
    return container.toJSON(base.toJSON({
      layout: layout
    }));
  }

  return self;
};
