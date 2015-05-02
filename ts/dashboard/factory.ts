module ts {

  export module models {

    var constructors = new Map<string, DashboardItemConstructor>()
    var metadata     = new Map<string, DashboardItemMetadata>()

    export function register_dashboard_item(item_class) {
      let meta = item_class.meta

      metadata.set(meta.item_type, meta)
      constructors.set(meta.item_type, item_class)

      if (meta.template && (typeof(meta.template) === 'string')) {
        meta.template = Handlebars.compile(meta.template)
      }

      if (meta.actions && meta.actions.length) {
        ts.actions.register(meta.item_type, meta.actions)
      }

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

      var category = meta.category ? 'new-item-' + meta.category : 'new-item'

      ts.actions.register(category, {
        name:     meta.item_type,
        display:  'Add new ' + (meta.display_name || meta.item_type),
        icon:     meta.icon || '',
        category: category,
        class:   'new-item',
        handler:  (action, container) => {
          container.add(item_class())
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
