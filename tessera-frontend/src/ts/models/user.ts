import { logger, extend } from '../util'
import Model     from './model'
import Dashboard from './dashboard'

declare var store
const log = logger('user')
const STORAGE_KEY = 'tessera.user'

/**
 * A very rudimentary user class. Since tessera doesn't have any
 * authentication yet, this basically represents the anonymous,
 * cookie-based session in the current browser. Eventually this will
 * represent a named user with real server-side persistence.
 */
export default class User extends Model {
  favorites = new Map<string, Dashboard>()

  constructor() {
    super()
    let data = store.get(STORAGE_KEY)
    if (data && data.favorites && data.favorites.map) {
      data.favorites = data.favorites.map((pair) => {
        let [key, dashboard_data] = pair
        return [key, new Dashboard(dashboard_data)]
      })
      this.favorites = new Map<string, Dashboard>(data.favorites)
    }
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      favorites: this.favorites
    })
  }

  add_favorite(d: Dashboard) : User {
    log.debug(`add_favorite(${d.href})`)
    if (!this.favorites.has(d.href)) {
      // Make a copy of the dashboard without the definition, to
      // minimize the amount of data stored locally.
      let dash = new Dashboard(d.toJSON())
        .set_definition(null)
      this.favorites.set(dash.href, dash)
      this.store()
    }
    return this
  }

  remove_favorite(d: Dashboard) : User {
    log.debug(`remove_favorite(${d.href})`)
    if (this.favorites.has(d.href)) {
      this.favorites.delete(d.href)
      this.store()
    }
    return this.store()
  }

  toggle_favorite(d: Dashboard) : boolean {
    if (this.favorites.has(d.href)) {
      this.remove_favorite(d)
      return false
    } else {
      this.add_favorite(d)
      return true
    }
  }

  list_favorites() : Dashboard[] {
    return [...this.favorites.values()]
  }

  store() : User {
    store.set(STORAGE_KEY, this.toJSON())
    return this
  }
}
