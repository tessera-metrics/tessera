declare var require

export function json(thing: any) : any {
  if (thing.toJSON && typeof(thing.toJSON) === 'function') {
    return thing.toJSON()
  } else {
    return thing
  }
}

export const extend = require('extend')
