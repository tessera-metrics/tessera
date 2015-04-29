module ts {
  // export type PropertyTemplate = string | ((ctx?: any) => string)

  export interface IProperty extends ts.registry.NamedObject {
    id: string
    type?: string
    template?: any
    edit_options: any

    render(item: any) : string
    edit(item: any) : IProperty
  }

  export class Property implements IProperty {
    name: string
    category: string
    id: string
    type: string
    template: any
    edit_options: any

    constructor(data?: any) {
      this.id = data.id
      this.name = data.name || this.id
      this.category = data.category
      this.type = data.type
        this.edit_options = data.edit_options
      if (typeof(data.template) === 'string') {
        this.template = Handlebars.compile(data.template)
      } else if (data.template && (data.template instanceof Function)) {
        this.template = data.template
      }
    }

    /**
     * Render the basic display of the property's value.
     */
    render(item) : string {
      let inner = undefined
      if (typeof this.template === 'string') {
        inner = item[this.name] || ''
      } else {
        inner = this.template({property: this, item: item})
      }
      return '<span id="' + item.item_id + this.name + '">'
        + inner
        + '</span>'
    }

    /**
     * Make the property editable by transforming its value display into
     * an in-line edit widget.
     */
    edit(item) : Property {
      let default_options = {
        type: 'text',
        value: item[this.name] || '',
        success: function(ignore, newValue) {
          item[this.name] = newValue
          ds.manager.update_item_view(item)
        }
      }
      let options = $.extend({}, default_options, this.edit_options)

      if (this.type === 'boolean') {
        options.type = 'checklist'
        options.source = [
          { value: true, text: this.name }
        ]
        options.success = function(ignore, newValue) {
          item[this.name] = newValue.length > 0
          ds.manager.update_item_view(item)
        }
      } else if (this.type) {
        options.type = this.type
      }

      if (this.type === 'select' && (options.source instanceof Array)) {
        options.source = options.source.map(function(value) {
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
        options.success = function(ignore, newValue) {
          options.update(item, newValue)
          ds.manager.update_item_view(item)
        }
      }

      $('#' + item.item_id + this.name).editable(options)

      return this
    }
  } /* end class Property */

  export const properties = new ts.registry.Registry<IProperty>({
    name: 'properties',
    process: function(data: any) : IProperty {
      if (data instanceof Property)
        return data
      return new Property(data)
    }
  })

} /* end module ts */

/** @deprecated */
ds.property = function(data) : ts.Property {
  if (data instanceof ts.Property)
    return data
  return new ts.Property(data)
}
