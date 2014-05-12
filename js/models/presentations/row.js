ds.models.row = function(data) {
  "use strict";

  var self = limivorous.observable()
                       .extend(ds.models.item, {item_type: 'row'})
                       .extend(ds.models.container)
                       .build()

  ds.models.item.init(self, data)
  ds.models.container.init(self, data)

  self.toJSON = function() {
    return ds.models.container.json(self, ds.models.item.json(self))
  }

  return self;
};
