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
    export class Action {
        name: string
        display: string
        icon: string
        show: string
        hide: string
        class: string
        options: any
        handler: any
        divider: boolean
        actions: Action[]
        category: string

        static DIVIDER = new Action({divider: true})

        constructor(data: any) {
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

    export const actions = ds.registry({
        name: 'actions',
        process: function(data) : Action {
            if (data instanceof Action)
                return data
            return new Action(data)
        }
    })
}

/** @deprecated */
ds.actions = ts.actions

/** @deprecated */
ds.action = function(data: any) : ts.Action {
    return new ts.Action(data)
}

/** @deprecated */
ds.action.divider = ts.Action.DIVIDER
