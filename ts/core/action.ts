/**
 * A model object describing a user-interface action. Actions may be
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
module ts {
  export interface IAction extends ts.registry.NamedObject {

    /* Display name of the action */
    display?: string

    /** A CSS icon class string to identify this action visually */
    icon?: string

    /** Application mode to show this action in. */
    show?: string

    /** Application mode to hide this action in. */
    hide?: string

    /** Additional CSS classes to apply to the rendered element */
    class?: string

    /* Is this even used? */
    options?: any

    /** A callback that is invoked when the action is run */
    handler?: (action: IAction, data: any) => void

    /** If true, just render a divider */
    divider?: boolean

    /** Sub-actions, for menu buttons */
    actions?: IAction[]
  }

  export class Action implements IAction {
    name: string
    display: string
    icon: string
    show: string
    hide: string
    class: string
    options: any
    handler: any
    divider: boolean
    actions: IAction[]
    category: string

    static DIVIDER = new Action({divider: true, name: 'DIVIDER'})

    constructor(data: IAction) {
      if (data) {
        this.name = data.name
        this.display = data.display
        this.icon = data.icon
        this.options = data.options
        this.handler = data.handler
        this.show = data.show
        this.hide = data.hide
        this.divider = data.divider
        this.class = data.class
        this.actions = data.actions
        this.category = data.category
      }
    }

    toJSON() : any {
      return {
        name: this.name,
        category: this.category,
        show: this.show,
        hide: this.hide,
        class: this.class,
        options: this.options
      }
    }
  }

  export const actions = new ts.registry.Registry<IAction>({
    name: 'actions',
    process: function(data) : IAction {
      if (data instanceof Action)
        return data
      return new Action(data)
    }
  })
}

/** @deprecated */
ds.action = function(data: any) : ts.IAction {
  return new ts.Action(data)
}

/** @deprecated */
ds.action.divider = ts.Action.DIVIDER

/** @deprecated */
ds.actions = ts.actions
