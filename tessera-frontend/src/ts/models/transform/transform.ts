import { NamedObject, Registry } from '../../core/registry'
import Action, { actions } from '../../core/action'
import manager from '../../app/manager'
import * as app from '../../app/app'
import Query from '../data/query'
import Markdown from '../items/markdown'
import { make } from '../items/factory'

export const TransformType = {
  DASHBOARD: 'dashboard',
  PRESENTATION: 'presentation'
}

export default class Transform implements NamedObject {
  name: string
  display_name: string
  transform_type: string
  private _transform: (any) => any /* for now */
  icon: string

  constructor(data?: any) {
    if (data) {
      this.name = data.name
      this.display_name = data.display_name
      this.transform_type = data.transform_type
      this._transform = data.transform
      this.icon = data.icon
    }
  }

  action() : Action {
    return new Action({
      name:    `${this.name}_action`,
      display: `${this.display_name}...`,
      icon:    this.icon || 'fa fa-eye',
      hide:    app.Mode.TRANSFORM,
      handler: (action, item) => {
        manager.apply_transform(this, item)
      }
    })
  }

  transform(item: any) : any {
    return this._transform
      ? this._transform(item)
      : item
  }

  toJSON() : any {
    return {
      name: this.name
    }
  }
}

export const transforms = new Registry<Transform>({
  name: 'transforms',
  process: (input: any) : Transform => {
    let transform = input instanceof Transform
      ? input
      : new Transform(input)
    let action_cat = `${transform.transform_type}-transform-actions`
    actions.register(action_cat, transform.action())
    return transform
  }
})

export function render_query(query: Query) : Markdown {
    let markdown = `
#### Query: ${query.name}

\`\`\`
${query.targets[0]}
\`\`\`
`
  return make('markdown')
    .set_text(markdown)
}
