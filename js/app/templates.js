cronenberg.templates = {};

cronenberg.templates.render_presentation = function(item) {
  var template = ds.templates.models[item.item_type];
  if (template) {
    if (template.dataHandler && item.query_name) {
      var definition = cronenberg.dashboards.current.dashboard.definition;
      definition.queries[item.query_name].on_load(function(query) {
        template.dataHandler(query, item);
      });
    }
    return template({item: item});
  }
  return "<p>Unknown item type <code>" + item.item_type + "</code></p>";
};
