ds.property.register([
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
        'callout_danger'
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
        'mean'
      ]
    }
  }
])
