import { NamedObject, Registry } from '../util'

export type ActionList = Action[]

/**
 * Type of a function which returns an action list, intended for late
 * binding lists of sub-actions by looking up categories in the
 * actions registry at runtime.
 *
 * @see actions
 */
export interface ActionListFunction {
  () : ActionList
}

/**
 * An object describing a user-interface action. Actions may be
 * rendered as either a menu item in a dropdown or a button in a
 * button bar.
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

  /** A callback that is run when the action is invoked.  */
  handler: (action: Action, data: any) => void

  /** If true, just render a divider */
  divider: boolean

  /** A list of additional sub-actions, which will cause the action to
   * be rendered as a dropdown button or a sub-menu. This can be
   * supplied as an immediate list of actions, a string naming an
   * action category, or a function returning a list of actions. */
  private _actions: string|ActionList|ActionListFunction

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

    } else if (typeof this._actions === 'string') {
      return actions.list(<string>this._actions)

    } else if (this._actions instanceof Array) {
      return <ActionList> this._actions

    } else {
      let fn = <ActionListFunction> this._actions
      return fn()
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
