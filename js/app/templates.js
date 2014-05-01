/**
 * Class - a registry of templates. Duh.
 */
cronenberg.TemplateRegistry = function() {
    this.presentation_registry = {};

    /**
     * Compile a template and register the compiled render function by
     * item type. Each template must specify what kind of API entity
     * it renders using the data-ds-item-type HTML attribute.
     *
     * An expression helper will also be registered, so each template
     * can be called easily from other templates.
     *
     * The template argument must be an object with the required
     * attribute 'elementId'.
     */
    this.register_presentation = function(template) {
        var self = this;
        var element  = $('#' + template.elementId);
        var itemType = element.attr('data-ds-item-type');
        var compiled = Handlebars.compile(element.html());

        self.presentation_registry[itemType] = {
            renderer: compiled,
            dataHandler: template.dataHandler || null
        };

        return self;
    };

    /**
     * Render an item (either presentation or layout) received from
     * the API and register it for data events.
     */
    this.render_presentation = function(item) {
        var self = this;

        var template = cronenberg.templates.presentation_registry[item.item_type];
        if (template) {
            // It's been registered with register_presentation()
            if (template.dataHandler && (typeof(item.query_name) != undefined)) {
                cronenberg.queries.registry[item.query_name].available(function(query) {
                    template.dataHandler(query, item);
                });
            }
            return template.renderer({item: item});
        }

        template = ds.templates.models[item.item_type];
        if (template) {
            if (template.dataHandler && item.query_name) {
                cronenberg.queries.registry[item.query_name].available(function(query) {
                    template.dataHandler(query, item);
                });
            }

            return template({item: item});
        }
        return "<p>Unknown item type <code>" + item.item_type + "</code></p>";
    };
};

cronenberg.templates = new cronenberg.TemplateRegistry();

// Because we can't dynamically dispatch the block helpers
// registered above, register another helper that can do that
// for generic rendering.
Handlebars.registerHelper('item', function(item) {
  return new Handlebars.SafeString(cronenberg.templates.render_presentation(item));
});
