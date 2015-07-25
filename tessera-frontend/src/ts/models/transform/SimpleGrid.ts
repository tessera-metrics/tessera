import Transform, { transforms, TransformType } from './transform'
import { make } from '../items/factory'
import { extend } from '../../core/util'
import Chart from '../items/chart'

/**
 * A transform which simply takes all presentations and arranges them in
 * a regular grid.
 */
export default class SimpleGrid extends Transform {
  private _columns : number = 1
  span: number = 12
  section_type: string = 'fixed'
  charts_only: boolean = false

  constructor(data?: any) {
    super(extend({}, data, {
      display_name: 'Simple Grid',
      name: 'SimpleGrid',
      transform_type: TransformType.DASHBOARD
    }))

    if (data) {
      this.columns = data.columns || this.columns
      this.section_type = data.section_type || this.section_type
      this.charts_only = !!data.charts_only
    }
    this.span = 12 / this.columns
  }

  /** Setter for the columns property recalculates the column
   * span to resize items to (based ona 12-column grid) */
  set columns(value: number) {
    this._columns = value
    this.span = 12 / value
  }

  get columns() : number {
    return this._columns
  }

  transform(item: any) : any {
    let items       = item.flatten()
    let section     = make('section').set_layout(this.section_type)
    let current_row = make('row')

    items.forEach( (item) => {
      if (   item.item_type === 'dashboard_definition'
             || item.item_type === 'cell'
             || item.item_type === 'row'
             || item.item_type === 'section'
             || (this.charts_only && !(item instanceof Chart))) {
        return
      }
      let cell = make('cell')
        .set_span(this.span)
        .add(item)

      if (current_row.add(cell).length == this.columns) {
        section.add(current_row)
        current_row = make('row')
      }
    } )

    if (current_row.length > 0) {
      section.add(current_row)
    }

    return section
  }

  toJSON() : any {
    return {
      columns: this.columns,
      span: this.span,
      section_type: this.section_type,
      charts_only: this.charts_only,
      name: this.name
    }
  }
}
