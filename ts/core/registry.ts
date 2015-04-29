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
        }

        /** Basic registry storage to support ordered listing and
         * lookup by name. */
        interface RegistryStorage<T> {
            list: T[],
            index: {
                [name: string] : T
            }
        }

        /** A map of category names to registry storage instances. */
        interface RegistryStorageDictionary<T> {
            [index: string] : RegistryStorage<T>
        }

        export interface RegistryInitializer<T> {
            name: string,
            process?: (data: any) => T
        }

        export class Registry<T extends NamedObject> {

            /** Storage for categorized lists of things */
            private data: RegistryStorageDictionary<T>

            /** Name of the registry */
            name: string

            /** When no category is explicitly specified, this one will be used */
            static DEFAULT_CATEGORY = 'default'

            /** Optional constructor function to process data before registering */
            process: (data: any) => T

            constructor(data: RegistryInitializer<T>) {
                this.name = data.name
                this.process = data.process
                this.data = {}
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
            register(data: T|T[]);
            register(category: string, data: T|T[]);
            register(cat: any, dat: any = Registry.DEFAULT_CATEGORY) : Registry<T> {
                let data: T|T[], category: string
                if (arguments.length == 1) {
                    category = Registry.DEFAULT_CATEGORY
                    data = <T|T[]>cat
                } else if (arguments.length == 2 && typeof cat === 'string') {
                    category = <string> cat
                    data = <T|T[]>dat
                }
                if (data instanceof Array) {
                    for (let d of data) {
                        this.register(category, d)
                    }
                } else {
                    let category_data = this._get_data(category)
                    let thing: T = this.process ? this.process(data) : <T> data
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

        } /* end class Registry<T> */

    } /* end module registry */
} /* end module ts */

ds.registry = function(init) {
    return new ts.registry.Registry<any>(init)
}