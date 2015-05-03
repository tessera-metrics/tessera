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
        return {
          id: this.id,
          href: this.href,
          name: this.name,
          description: this.description,
          color: this.color,
          count: this.count,
        }
      }
    }
  }
}
