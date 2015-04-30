/**
 * A simple registry for organizing and retrieving ordered sets of
 * named objects. Each registry instance organizes its values into
 * categories, allowing retrieval of individual values by name, or
 * lists of values by category.
 *
 * Objects stored in a registry must have a 'name' property.
 */
module ts {
  export module registry {

    /** Objects which have a name. All objects stored in
     * registries must implemented NamedObject. */
    export interface NamedObject {
      name: string
      category?: string
    }

    /** Basic registry storage to support ordered listing and
     * lookup by name. */
    interface RegistryStorage<T> {
      list: T[]
      index: {
        [name: string] : T
      }
    }

    /** A map of category names to registry storage instances. */
    interface RegistryStorageDictionary<T> {
      [index: string] : RegistryStorage<T>
    }

    /**
     * Options for initializing a new registry.
     */
    export interface RegistryOptions<T> {
      name: string
      process?: (data: any) => T
      ignore_categories?: boolean
    }

    /**
     * A registry of named objects which supports categorizing
     * those objects into one or more categories, listing them by
     * category, or looking up individual objects by category and
     * name.
     */
    export class Registry<T extends NamedObject> {

      private log: ts.log.Logger

      /** Internal storage for categorized lists of things. */
      private data: RegistryStorageDictionary<T>

      /** Name of the registry */
      name: string

      /** Optional constructor function to process data before registering */
      process: (data: any) => T

      /** If set to true, ignore categories and store everything in
       * the default category */
      ignore_categories: boolean

      /** When no category is explicitly specified, this one will be used */
      static DEFAULT_CATEGORY = 'default'

      constructor(data: RegistryOptions<T>) {
        this.name = data.name
        this.process = data.process
        this.ignore_categories = !!data.ignore_categories
        this.data = {}
        this.log = ts.log.logger(`tessera.registry.${this.name}`)
      }

      _get_data(category: string) : RegistryStorage<T> {
        if (!this.data[category]) {
          this.data[category] = {
            list: [],
            index: {}
          }
        }
        return this.data[category]
      }

      /**
       * Add a named object to the registry. If no category name is
       * supplied, it will be assigned to the default category.
       *
       * The overload declarations and parameter munging are in
       * order to maintain compatibility with the original
       * JavaScript signature.
       */
      register(data: any)
      register(data: T|T[]);
      register(category: string, data: T|T[]);
      register(cat: any, dat: any = Registry.DEFAULT_CATEGORY) : Registry<T> {
        let data: T|T[], category: string

        if (arguments.length == 1) {
          data = <T|T[]>cat
          category = Registry.DEFAULT_CATEGORY
        } else if (arguments.length == 2 && typeof cat === 'string') {
          category = <string> cat
          data = <T|T[]>dat
        }

        if (data instanceof Array) {
          for (let d of data) {
            this.register(category, d)
          }
        } else {
          if (this.ignore_categories) {
            category = Registry.DEFAULT_CATEGORY
          } else if ((<T>data).category && category == Registry.DEFAULT_CATEGORY) {
            category = (<T>data).category
          }
          let category_data = this._get_data(category)
          let thing: T = this.process ? this.process(data) : <T> data
          this.log.debug(`Registering "${category}" / "${thing.name}"`)
          if (!category_data.index[thing.name]) {
            category_data.index[thing.name] = thing
          }
          category_data.list.push(thing)
        }
        return this
      }

      /**
       * Return a list of all values assigned to the named category. If no
       * category name is supplied, the values assigned to the default
       * category will be returned.
       */
      list(category: string = Registry.DEFAULT_CATEGORY) : T[] {
        return this.data[category] ? this.data[category].list : []
      }

      /**
       * Retrieve a single value from a category by name. If only a name
       * is supplied, the default category will be used.
       */
      get(cat: string, nm?: string) : T {
        let category = cat, name = nm
        if (arguments.length == 1) {
          category = Registry.DEFAULT_CATEGORY
          name = cat
        }
        if (this.ignore_categories) {
          category = Registry.DEFAULT_CATEGORY
        }
        return this.data[category]
          ? this.data[category].index[name]
          : null
      }

      /**
       * Return a list of all registered categories.
       */
      categories() : string[] {
        return Object.keys(this.data)
      }
    }

  } /* end module registry */
} /* end module ts */
