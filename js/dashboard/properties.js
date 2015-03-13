ds.property.register([
  {
    id: 'query',
    category: 'base',
    template: '{{item.query.name}}',
    edit_options: {
      type: 'select',
      source: function() {
        var queries = ds.manager.current.dashboard.definition.queries
        return Object.keys(queries).map(function(k) {
                 return { value: k, text: k }
               })
      },
      value: function(item) {
        return item.query ? item.query.name : undefined
      }
    }
  },
  {
    id: 'style',
    type: 'select',
    edit_options: {
      source: [
        undefined,
        'well',
        'callout_neutral',
        'callout_info',
        'callout_success',
        'callout_warning',
        'callout_danger',
        'alert_neutral',
        'alert_info',
        'alert_success',
        'alert_warning',
        'alert_danger'
      ]
    }
  },
  {
    id: 'transform',
    type: 'select',
    edit_options: {
      source: [
        undefined,
        'sum',
        'min',
        'max',
        'mean',
        'median',
        'first',
        'last',
        'count'
      ]
    }
  }
])
