import DashboardItem, { DashboardItemVisitor } from './item'
import { extend } from '../../core/util'
import { make } from './factory'
import manager from '../../app/manager'

/**
 * Base class for all dashboard items that contain other items.
 */
export default class Container extends DashboardItem {
  items: DashboardItem[] = []

  get length() : number {
    return this.items ? this.items.length : 0
  }

  constructor(data?: any) {
    super(data)
    if (data && data.items) {
      this.items = data.items.map(i => make(i))
    }
  }

  /**
   * Find the index of a contained dashboard item.
   *
   * @return The numeric index (0-based) or -1 if not found.
   */
  find(item_or_id: string|DashboardItem) : number {
    var id = item_or_id
    if (item_or_id instanceof DashboardItem) {
      id = item_or_id.item_id
    }
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].item_id === id) {
        return Number(i)
      }
    }
    return -1
  }

  contains(item_or_id: string|DashboardItem) : boolean {
    return this.find(item_or_id) > -1
  }


  visit(visitor: DashboardItemVisitor) : DashboardItem {
    visitor(this)
    this.items.forEach(item => {
      if (item.visit && typeof(item.visit) === 'function') {
        item.visit(visitor)
      } else {
        visitor(item)
      }
    })
    return this
  }

  add(item: string|DashboardItem) : DashboardItem {
    if (typeof(item) === 'string') {
      item = make(item)
    }
    this.items.push(<DashboardItem>item)
    // TODO
    // this.notify('items')
    /* This should go in an event handler */
    manager.current.dashboard.update_index()
    manager.update_item_view(this)
    return this
  }

  add_after(item: string|DashboardItem, new_item: DashboardItem) : DashboardItem {
    let index = this.find(item)
    if ((index === -1) || index === (this.length - 1)) {
      this.items.push(new_item)
    } else {
      this.items.splice(index + 1, 0, new_item)
    }
    // TODO
    // this.notify('items')
    return this
  }

  remove(item) : boolean {
    let index = this.find(item)
    if (index < 0) {
      return false
    }
    this.items.splice(index, 1)
    // TODO
    // this.notify('items')
    return true
  }

  /**
   * Move the position of a child item in the list, either up or
   * down one position. The position will not wrap - if the child
   * is a the beginning or end of the list, it will not be moved.
   *
   * @param item {object} A dashboard item. Must be a child of
   *                      this container.
   * @param increment {number} Either 1 to move the element up one
   *                           place, or -1 to move it back one
   *                           element.
   */
  move(item: DashboardItem, increment: number) {
    let index = this.find(item)
    if (index < 0) {
      return false
    }
    if (index == 0 && increment < 0) {
      return false
    }
    if (index == (this.length - 1) && increment > 0) {
      return false
    }
    let target_index = index + increment
    let tmp = this.items[target_index]
    this.items[target_index] = item
    this.items[index] = tmp
    // TODO
    // this.notify('items')
    return true
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      items: this.items.map(i => i.toJSON())
    })
  }
}
