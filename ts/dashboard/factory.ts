module ts {

  export module models {

    var constructors = new Map<string, DashboardItemConstructor>()
    var metadata     = new Map<string, DashboardItemMetadata>()

    /**
     * Register a dashboard item type.
     *
     * Each dashboard item class must have the following members:
     *   - A constructor with the signature `new(data?: any)`
     *   - Optionally a static `meta` property of type `DashboardItemMetadata`
     *
     * @see DashboardItemConstructor
     */
    export function register_dashboard_item(item_class: DashboardItemConstructor) {
      if (!item_class.meta) {
        item_class.meta = {}
      }

      let meta = item_class.meta
      if (!meta.item_type) {
        meta.item_type = inflection.underscore(item_class.name)
      }

      metadata.set(meta.item_type, meta)
      constructors.set(meta.item_type, item_class)

      //
      // Compile the template if necessary (after setting it based on
      // the item_type if it wasn't already provided).
      //

      if (!meta.template) {
        meta.template = ds.templates.models[meta.item_type]
      }

      if (meta.template && (typeof(meta.template) === 'string')) {
        meta.template = Handlebars.compile(meta.template)
      }

      //
      // Register any item-specific action
      //

      if (meta.actions && meta.actions.length) {
        ts.actions.register(meta.item_type, meta.actions)
      }

      //
      // Set any missing metadata fields by munging the item type.
      //

      if (!meta.display_name) {
        meta.display_name = inflection.titleize(meta.item_type)
      }

      //
      // Create a test instance to fetch the complete list of
      // interactive properties, then sort them and cache them in the
      // meta object.
      //

      let instance = new item_class()
      let props = instance.interactive_properties().map(p => ds.property(p))
      props.sort((p1, p2) => {
        if (p1.category === p2.category) {
          return p1.property_name.localeCompare(p2.property_name)
        } else {
          return (p1.category || '').localeCompare(p2.category || '')
        }
      })
      meta.interactive_properties = props

      //
      // Create and register a new action to instantiate the dashboard
      // item type in the editor UI
      //

      var category = meta.category ? 'new-item-' + meta.category : 'new-item'

      ts.actions.register({
        name:      meta.item_type,
        category:  category,
        display:   'Add new ' + (meta.display_name || meta.item_type),
        icon:      meta.icon || '',
        css:       'new-item',
        handler:  (action, container) => {
          container.add(new item_class())
        }
      })
    }

    export function make(data: any, init?: any) {

      if (data instanceof DashboardItem) {
        return data
      }

      if ((typeof(data) === 'string') && constructors.has(data)) {
        return new (constructors.get(data))(init)
      }

      if (data.item_type && constructors.has(data.item_type)) {
        return new (constructors.get(data.item_type))(data)
      }

      console.error('Unknown item type ' + data.toString())

      return null
    }
  }
}
