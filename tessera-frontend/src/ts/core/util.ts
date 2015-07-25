declare var extend_impl

export function json(thing: any) : any {
  if (thing.toJSON && typeof(thing.toJSON) === 'function') {
    return thing.toJSON()
  } else {
    return thing
  }
}

export function extend(...args: any[]) : any {
  return extend_impl(...args)
}
