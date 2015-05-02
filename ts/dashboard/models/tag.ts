module ts {
  export module models {
    export class Tag extends Model {
      id: string
      href: string
      name: string
      description: string
      color: string
      count: number

      constructor(data?: any) {
        super(data)
        if (data) {
          if (typeof data === 'string') {
            this.name = data
          } else {
            this.id = data.id
            this.href = data.href
            this.name = data.name
            this.description = data.description
            this.color = data.color
            this.count = data.count
          }
        }
      }

      toJSON() : any {
        var json : any = {}
        if (this.id)
          json.id = this.id
        if (this.href)
          json.href = this.href
        if (this.name)
          json.name = this.name
        if (this.description)
          json.description = this.description
        if (this.color)
          json.color = this.color
        if (this.count)
          json.count = this.count
        return json
      }
    }
  }
}
