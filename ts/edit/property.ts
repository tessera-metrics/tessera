module ts {
  // export type PropertyTemplate = string | ((ctx?: any) => string)

  const proplog = ts.log.logger('tessera.property')

  export const PropertyType = {
    SELECT: 'select',
    BOOLEAN: 'boolean',
    TEXT: 'text'
  }

  export interface PropertyDescriptor {
    name: string
    property_name?: string
    category?: string
    type?: string
    template?: string|TemplateFunction
    edit_options?: any
  }

  export class Property implements ts.registry.NamedObject {

    /** Canonical ID of the property */
    name: string

    category: string

    /** In the event that the multiple items have the same property
     * name, but different processing requirements, they should each
     * have a unique {name} field, and set the {property_name} field
     * to the actual object property name. If property_name is not
     * explicitly set, it will be the same as name. */
    property_name: string

    /** The type of the property for the purpose of selecting an edit
     * widget. */
    type: string

    /** Template for rendering the property's value in an edit
     * widget. This can be supplied to the constructo as eithre a
     * string or a function that returns a string. If this is a
     * string, it will be compiled as a Handlebars template.
     *
     * If no template is supplied, the value's toString() value will
     * be used.  */
    template: TemplateFunction

    /** Options for setting up the edit widget. Things such as the
     * valid set of values for a select widget go here.  */
    edit_options: any

    constructor(data?: any) {
      this.name = data.name
      this.property_name = data.property_name || this.name
      this.category = data.category
      this.type = data.type
      this.edit_options = data.edit_options
      if (data.template && typeof(data.template) === 'string') {
        proplog.debug(`Compiling template for property "${this.name}" -> "${data.template}"`)
        this.template = Handlebars.compile(data.template)
      } else if (data.template && (data.template instanceof Function)) {
        this.template = data.template
      } else {
        this.template = null
      }
    }

    /**
     * Render the basic display of the property's value.
     */
    render(item) : string {
      proplog.debug(`render(${this.name} / ${item.item_id})`)
      let inner = undefined
      if (this.template == null) {
        let value = item[this.property_name]
        inner = value ? value.toString() : ''
      } else if (this.template instanceof Function) {
        inner = this.template({property: this, item: item})
      }
      return `<span id="${item.item_id}${this.property_name}">${inner}</span>`
    }

    /**
     * Make the property editable by transforming its value display into
     * an in-line edit widget.
     */
    edit(item) : Property {
      proplog.debug(`edit(${this.name} / ${item.item_id})`)
      let default_options = {
        type: PropertyType.TEXT,
        value: item[this.property_name] || '',
        success: (ignore, newValue) => {
          proplog.debug(`update(${item.item_id}.${this.property_name}) => ${newValue}`)
          item[this.property_name] = newValue
          ts.manager.update_item_view(item)
        }
      }
      let options = $.extend({}, default_options, this.edit_options)

      if (this.type === PropertyType.BOOLEAN) {
        options.type = 'checklist'
        options.source = [
          { value: true, text: this.property_name }
        ]
        options.success = (ignore, newValue) => {
          item[this.property_name] = newValue.length > 0
          ts.manager.update_item_view(item)
        }
      } else if (this.type) {
        options.type = this.type
      }

      if (this.type === 'select' && (options.source instanceof Array)) {
        options.source = options.source.map((value) => {
          if ( value instanceof String ) {
            return { value: value, text: value }
          } else if (typeof(value) === 'undefined') {
            return { value: undefined, text: 'none' }
          } else {
            return value
          }
        })
      }

      if (options.source && (options.source instanceof Function)) {
        options.source = options.source()
      }

      if (options.value && (options.value instanceof Function)) {
        options.value = options.value(item)
      }

      if (options.update && (options.update instanceof Function)) {
        options.success = (ignore, newValue) => {
          options.update(item, newValue)
          ts.manager.update_item_view(item)
        }
      }

      let selector = `#${item.item_id}${this.property_name}`
      proplog.debug(`editable(${selector})`)
      $(selector).editable(options)

      return this
    }
  } /* end class Property */

  export const properties = new ts.registry.Registry<Property>({
    name: 'properties',
    ignore_categories: true,
    process: function(data: any) : Property {
      if (data instanceof Property) {
        return data
      } else if (typeof data === 'string') {
        return new Property({ name: data })
      } else {
        return new Property(data)
      }
    }
  })

} /* end module ts */

ds.property = function(data) : ts.Property {
  if (data instanceof ts.Property) {
    return data
  } else if (typeof data === 'string') {
    let prop = ts.properties.get(data)
    return prop ? prop : new ts.Property({ name: data })
  } else {
    return new ts.Property(data)
  }
}
