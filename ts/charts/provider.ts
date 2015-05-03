module ts {
  export module charts {

    export const provider = function(data) {
      var self = limivorous.observable()
        .property('name')
        .property('is_interactive', {init: false})
        .property('description')
        .build()

      self.is_chart_provider = true

      if (data) {
        self.name = data.name
        self.is_interactive = Boolean(data.is_interactive)
        self.description = data.description
      }

      return self
    }

  }
}
