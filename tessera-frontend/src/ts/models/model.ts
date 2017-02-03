import EventSource from '../util/event-source'

/**
 * Base class for all API model classes
 */
export default class Model extends EventSource {

  constructor(data?: any) {
    super(data)
  }

  toJSON() : any {
    return {}
  }
}
