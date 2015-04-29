module ts {
  export interface ITransformProperties extends ts.registry.NamedObject {
    display_name?: string
    transform_type?: string
    icon?: string
    transform: (any) => any
  }

  export interface ITransform extends ITransformProperties {
    action() : ts.Action
  }

  export class Transform implements ITransform {
    name: string
    display_name: string
    transform_type: string
    transform: (any) => any /* for now */
    icon: string

    constructor(data?: ITransformProperties) {
      if (data) {
        this.name = data.name
        this.display_name = data.display_name
        this.transform_type = data.transform_type
        this.transform = data.transform
        this.icon = data.icon
      }
    }

    action() : ts.Action {
      return new ts.Action({
        name:    `${this.name}_action`,
        display: `${this.display_name}...`,
        icon:    this.icon || 'fa fa-eye',
        hide:    ds.app.Mode.TRANSFORM,
        handler: (action, item) => {
          ds.manager.apply_transform(this, item)
        }
      })
    }

    toJSON() : any {
      return {
        name: this.name
      }
    }
  }

  export const transforms = new ts.registry.Registry<ITransform>({
    name: 'transforms',
    process: (data) : ITransform => {
      let transform  = new ts.Transform(data)
      let action_cat = `${transform.transform_type}-transform-actions`
      ts.actions.register(action_cat, transform.action())
      return transform
    }
  })
}

/** @deprecated */
ds.transforms = ts.transforms
