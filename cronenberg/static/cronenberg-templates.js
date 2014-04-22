/**
 * Class - a registry of templates. Duh.
 */
cronenberg.TemplateRegistry = function() {
    this.presentation_registry = {};

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
    this.register_presentation = function(template) {
        var self = this;
        var element  = $('#' + template.elementId);
        var itemType = element.attr('data-item-type');
        var compiled = template.renderHandler || Handlebars.compile(element.html());

        self.presentation_registry[itemType] = {
            renderer: compiled,
            dataHandler: template.dataHandler || null
        };

        // Register a helper for the item time, so it can be
        // explicitly called from another template - i.e {{row
        // path.to.a.row}}.
        Handlebars.registerHelper(itemType, function(item) {
            return cronenberg.templates.presentation_registry[itemType]({ item: item });
        });

        // Because we can't dynamically dispatch the block helpers
        // registered above, register another helper that can do that
        // for generic rendering.
        Handlebars.registerHelper('item', function(item) {
            return new Handlebars.SafeString(cronenberg.templates.render_presentation(item));
        });

        Handlebars.registerHelper('format', function(format, value) {
            return d3.format(format)(value);
        });
        Handlebars.registerHelper('height', function(item) {
            return item.height ? 'dashboard-height' + item.height : '';
        });
        Handlebars.registerHelper('span', function(item) {
            return item.span ? 'col-md-' + item.span : '';
        });
        Handlebars.registerHelper('offset', function(item) {
            return item.offset ? 'col-md-offset-' + item.offset : '';
        });
        Handlebars.registerHelper('css_class', function(item) {
            return item.css_class ? item.css_class : '';
        });
        Handlebars.registerHelper('style_class', function(item) {
            if (item.style) {
                switch (item.style) {
                case 'well':
                    return 'well';
                case 'callout_neutral':
                    return 'bs-callout bs-callout-neutral';
                case 'callout_info':
                    return 'bs-callout bs-callout-info';
                case 'callout_success':
                    return 'bs-callout bs-callout-success';
                case 'callout_warning':
                    return 'bs-callout bs-callout-warning';
                case 'callout_danger':
                    return 'bs-callout bs-callout-danger';
                }
            }  else {
                return '';
            }
        });

        return this;
    };

    /**
     * Render an item (either presentation or layout) received from
     * the API and register it for data events.
     */
    this.render_presentation = function(item) {
        var self = this;
        var template = cronenberg.templates.presentation_registry[item.item_type];
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
