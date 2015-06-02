import Model from './model'

export default class Thresholds extends Model {
  summation_type: string
  warning: number
  danger: number

  constructor(data?: any) {
    super(data)
    if (data) {
      this.summation_type = data.summation_type  || 'mean'
      this.warning = data.warning
      this.danger = data.danger
    }
  }

  toJSON() : any {
    return {
      summation_type: this.summation_type,
      warning: this.warning,
      danger: this.danger
    }
  }
}
