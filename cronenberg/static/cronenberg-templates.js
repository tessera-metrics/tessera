/**
 * Class - a registry of templates. Duh.
 */
cronenberg.TemplateRegistry = function() {
    this.registry = {};

    /**
     * Compile a template and register the compiled render function by
     * item type. Each template must specify what kind of API entity
     * it renders using the data-item-type HTML attribute.
     */
    this.register = function(elementId) {
        element = $('#' + elementId);
        this.registry[element.attr('data-item-type')] = Handlebars.compile(element.html());
        return this;
    };

    /**
     * Render an item (either presentation or layout) received from
     * the API.
     *
     * TODO: should this append to the parent, or leave that to the
     * caller? Leaning towards the latter.
     */
    this.render = function(item, parent) {
        var template = this.registry[item.type];
        $(parent).append(template({item: item}));
    };
};

cronenberg.templates = new cronenberg.TemplateRegistry();
