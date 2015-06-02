import Model from './model'

export default class Axis extends Model {
  visible: boolean
  label: string
  label_distance: number
  format: string
  min: number
  max: number

  constructor(data?: any) {
    super(data)
    if (data) {
      this.visible = data.visible
      this.label = data.label
      this.label_distance = data.label_distance
      this.format = data.format
      this.min = data.min
      this.max = data.max
    }
  }

  toJSON() : any {
    return {
      visible: this.visible,
      label: this.label,
      label_distance: this.label_distance,
      format: this.format,
      min: this.min,
      max: this.max
    }
  }
}
