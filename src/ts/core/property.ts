import { logger } from './log'
import { extend } from './util'
import { NamedObject, Registry } from './registry'
import Template from './template'

declare var $

const log = logger('property')

export const PropertyType = {
  SELECT: 'select',
  BOOLEAN: 'boolean',
  TEXT: 'text'
}

/**
 * A description of the data format for initializing a property.
 */
export interface PropertyDescriptor {
  name: string
  property_name?: string
  category?: string
  type?: string
  template?: Template
  edit_options?: any
}

/**
 * Entries in a property list can be property names, plain objects
 * describing a property, or instances of Property. When a dashboard
 * item is registered the properties will be canonicalized.
 *
 * @see property()
 * @see PropertyList
 */
export type PropertyListEntry = string|PropertyDescriptor|Property

export type PropertyList      = PropertyListEntry[]

export default class Property implements NamedObject {

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
  template: Template

  /** Options for setting up the edit widget. Things such as the
   * valid set of values for a select widget go here.  */
  edit_options: any

  constructor(data?: any) {
    this.name = data.name
    this.property_name = data.property_name || this.name
    this.category = data.category
    this.type = data.type
    this.edit_options = data.edit_options
    this.template = new Template(data.template)
  }

  /**
   * Render the basic display of the property's value.
   */
  render(item) : string {
    log.debug(`render(${this.name} / ${item.item_id})`)
    let inner = undefined
    if (this.template == null) {
      let value = item[this.property_name]
      inner = value ? value.toString() : ''
    } else {
      inner = this.template.render({property: this, item: item})
    }
    return `<span id="${item.item_id}${this.property_name}">${inner}</span>`
  }

  /**
   * Make the property editable by transforming its value display into
   * an in-line edit widget.
   */
  edit(item) : Property {
    log.debug(`edit(${this.name} / ${item.item_id})`)
    let default_options = {
      type: PropertyType.TEXT,
      value: item[this.property_name] || '',
      success: (ignore, newValue) => {
        log.debug(`update(${item.item_id}.${this.property_name}) => ${newValue}`)
        item[this.property_name] = newValue
        if (item.updated) {
          item.updated()
        }
      }
    }
    let options = extend({}, default_options, this.edit_options)

    if (this.type === PropertyType.BOOLEAN) {
      extend(options, {
        type: 'select',
        source:  [
          { value: 'no', text: 'no' },
          { value: 'yes', text: 'yes' }
        ],
        value: (item) => {
          let value = !!(item[this.property_name])
          return value ? 'yes' : 'no'
        },
        success: (ignore, newValue) => {
          log.debug(`boolean.success: ${this.property_name}: ${newValue} / ${typeof newValue}`)
          item[this.property_name] = (newValue === 'yes')
          if (item.updated) {
            item.updated()
          }
        }
      })
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
        if (item.fire_update) {
          item.fire_update()
        }
      }
    }

    let selector = `#${item.item_id}${this.property_name}`
    log.debug(`editable(${selector})`)
    $(selector).editable(options)

    return this
  }
}

/**
 * Registry of property definitions. Properties which have complex
 * handlers and are shared between multiple dashboard items should be
 * registered.
 */
export const properties = new Registry<Property>({
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

/**
 * Canonicalize properties.
 */
export function property(data) : Property {
  if (data instanceof Property) {
    return data
  } else if (typeof data === 'string') {
    let prop = properties.get(data)
    return prop ? prop : new Property({ name: data })
  } else {
    return new Property(data)
  }
}
