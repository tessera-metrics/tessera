import DashboardItem, {
  DashboardItemConstructor,
  DashboardItemMetadata
} from './item'
import * as core from '../../core'

declare var require, Handlebars, ts

const inflection = require('inflection')
const log = core.logger('models.factory')

var constructors = new Map<string, DashboardItemConstructor>()
export var metadata = new Map<string, DashboardItemMetadata>()

/**
 * Walk up a dashboard item's inheritance chain and produce a list
 * of metadata objects, ordered from least specific to most
 * specific.
 */
export function get_metadata_list(item_class: DashboardItemConstructor) : DashboardItemMetadata[] {
  let metas = []
  while (item_class && DashboardItem.isPrototypeOf(item_class)) {
    if (item_class['meta']) {
      metas.push(item_class['meta'])
    }
    item_class = Object.getPrototypeOf(item_class)
  }
  return metas.reverse()
}

/**
 * Get the metadata for a dashboard item class, merged with the
 * metadata of its parent classes.
 */
export function get_merged_metadata(item_class: DashboardItemConstructor) : DashboardItemMetadata {
  let metas = get_metadata_list(item_class)
  return core.extend({}, ...metas)
}

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

  //
  // First make sure the class has metadata, creating whatever we
  // can programmatically if it's not specified explicitly.
  //

  let meta : DashboardItemMetadata = {}

  if (item_class.meta && item_class.hasOwnProperty('meta')) {
    meta = item_class.meta
  } else {
    item_class.meta = meta
  }

  // Set any missing metadata fields by munging the item type.
  if (!meta.item_type) {
    meta.item_type = inflection.underscore(item_class.name)
  }
  if (!meta.display_name) {
    meta.display_name = inflection.titleize(meta.item_type)
  }
  if (!meta.template && ts.templates.models[meta.item_type]) {
    meta.template = ts.templates.models[meta.item_type]
  }

  //
  // Merge the immediate metadata with any parent metadata.
  //

  item_class.meta = meta = get_merged_metadata(item_class)

  //
  // Compile the template if necessary.
  //

  if (meta.template && (typeof(meta.template) === 'string')) {
    meta.template = Handlebars.compile(meta.template)
  }

  //
  // Register any item-specific action
  //

  if (meta.actions && meta.actions.length) {
    core.actions.register(meta.item_type, meta.actions)
  }

  //
  // Create a test instance to fetch the complete list of
  // interactive properties, then sort them and cache them in the
  // meta object.
  //

  let instance = new item_class()
  let props = instance.interactive_properties().map(p => core.property(p))
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

  let category = meta.category ? `new-item-${meta.category}` : 'new-item'

  core.actions.register({
    name:      meta.item_type,
    category:  category,
    display:   `Add new ${(meta.display_name || meta.item_type)}`,
    icon:      meta.icon || '',
    css:       'new-item',
    handler:  (action, container) => {
      container.add(new item_class())
    }
  })

  //
  // Cache the constructor and metadata globally.
  //

  metadata.set(meta.item_type, meta)
  constructors.set(meta.item_type, item_class)

  log.debug(`registered ${meta.item_type}`)
}

export function make(data: any, init?: any) : any {

  if (data instanceof DashboardItem) {
    return data
  }

  if ((typeof(data) === 'string') && constructors.has(data)) {
    return new (constructors.get(data))(init)
  }

  if (data.item_type && constructors.has(data.item_type)) {
    return new (constructors.get(data.item_type))(data)
  }

  log.error(`Unknown item type ${JSON.stringify(data)}`)

  return null
}
