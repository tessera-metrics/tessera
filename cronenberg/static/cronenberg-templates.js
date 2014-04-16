/**
 * Class - a registry of templates. Duh.
 */
cronenberg.TemplateRegistry = function() {
    this.registry = {};

    /**
     * Compile a template and register the compiled render function by
     * item type. Each template must specify what kind of API entity
     * it renders using the data-item-type HTML attribute.
     *
     * An expression helper will also be registered, so each template
     * can be called easily from other templates.
     *
     * The template argument must be an object with the required
     * attribute 'elementId'.
     */
    this.register = function(template) {
        var element  = $('#' + template.elementId);
        var itemType = element.attr('data-item-type');
        var compiled = template.renderHandler || Handlebars.compile(element.html());

        this.registry[itemType] = {
            renderer: compiled,
            dataHandler: template.dataHandler || null
        };

        // Register a helper for the item time, so it can be
        // explicitly called from another template - i.e {{row
        // path.to.a.row}}.
        Handlebars.registerHelper(itemType, function(item) {
            return cronenberg.templates.registry[itemType]({ item: item });
        });

        // Because we can't dynamically dispatch the block helpers
        // registered above, register another helper that can do that
        // for generic rendering.
        Handlebars.registerHelper('item', function(item) {
            return new Handlebars.SafeString(cronenberg.templates.render(item));
        });

        // A helper for formatting numeric values
        Handlebars.registerHelper('format', function(format, value) {
            return d3.format(format)(value);
        });
        return this;
    };

    /**
     * Render an item (either presentation or layout) received from
     * the API and register it for data events.
     */
    this.render = function(item) {
        var template = cronenberg.templates.registry[item.item_type];
        if (typeof(template) == "undefined") {
            return "<p>Unknown item type <code>" + item.item_type + "</code></p>";
        }
        if (template.dataHandler && (typeof(item.query_name) != undefined)) {
            cronenberg.queries.registry[item.query_name].available(function(query) {
                template.dataHandler(query, item);
            });
        }
        return template.renderer({item: item});
    };
};

cronenberg.templates = new cronenberg.TemplateRegistry();
