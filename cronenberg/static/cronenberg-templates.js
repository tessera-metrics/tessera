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
     */
    this.register = function(elementId) {
        var element  = $('#' + elementId);
        var itemType = element.attr('data-item-type');
        var compiled = Handlebars.compile(element.html());

        this.registry[itemType] = compiled;
        Handlebars.registerHelper(itemType, function(item) {
            return new Handlebars.SafeString(
                cronenberg.templates.registry[itemType]({ item: item })
            );
        });
        return this;
    };

    /**
     * Render an item (either presentation or layout) received from
     * the API.
     */
    this.render = function(item) {
        var template = this.registry[item.item_type];
        return template({item: item});
    };
};

cronenberg.templates = new cronenberg.TemplateRegistry();
