import { NamedObject, Registry } from './registry'

export type ActionList = Action[]

export interface ActionListFunction {
  () : ActionList
}


/**
 * An object describing a user-interface action. Actions may be
 * rendered as either a menu item in a dropdown or a button in a
 * button bar.
 *
 * actions - a list of additional actions, causing this action to be
 *           rendered as a dropdown button or sub-menu.
 * icon - CSS classes to render a Font Awesome icon.
 * handler - callback function to run when the action is invoked.
 * category - action category to register this action in .
 * divider - if true, this action will simply render as a divider between action groups.
 */
export default class Action implements NamedObject {

  /** NamedObject - identity of the action */
  name: string

  /** NamedObject - category to register the action under */
  category: string

  /* Display name of the action */
  display: string

  /** A CSS icon class string to identify this action visually */
  icon: string

  /** Application mode to show this action in. */
  show: string

  /** Application mode to hide this action in. */
  hide: string

  /** Additional CSS classes to apply to the rendered element */
  css: string

  /* Is this even used? */
  options: any

  /** A callback that is invoked when the action is run */
  handler: (action: Action, data: any) => void

  /** If true, just render a divider */
  divider: boolean

  /** Sub-actions, for menu buttons */
  private _actions: ActionList|ActionListFunction

  static DIVIDER = new Action({divider: true, name: 'DIVIDER'})

  constructor(data?: any) {
    if (data) {
      this.name = data.name
      this.display = data.display
      this.icon = data.icon
      this.options = data.options
      this.handler = data.handler
      this.show = data.show
      this.hide = data.hide
      this.divider = data.divider
      this.css = data.css
      this._actions = data.actions
      this.category = data.category
    }
  }

  get actions() : ActionList {
    if (typeof this._actions === 'undefined' ) {
      return undefined
    } else if (this._actions instanceof Array) {
      return <ActionList> this._actions
    } else {
      let fn = <ActionListFunction> this._actions
      return fn()
    }
  }

  toJSON() : any {
    return {
      name: this.name,
      category: this.category,
      show: this.show,
      hide: this.hide,
      css: this.css,
      options: this.options
    }
  }
}

export const actions = new Registry<Action>({
  name: 'actions',
  process: function(data) : Action {
    if (data instanceof Action)
      return data
    return new Action(data)
  }
})
