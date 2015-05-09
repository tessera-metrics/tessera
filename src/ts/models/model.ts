/**
 * Base class for all API model classes
 */
export default class Model {

  constructor(data?: any) {
  }

  toJSON() : any {
    return {}
  }

  on(event: string, handler) {
    // TODO
  }


}
