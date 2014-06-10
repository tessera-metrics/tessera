ds.property.register([
  {
    id: 'style',
    type: 'select',
    edit_options: {
      source: [
        { value: undefined, text: 'none' },
        { value: 'well', text: 'well' },
        { value: 'callout_neutral', text: 'callout_neutral' },
        { value: 'callout_info', text: 'callout_info' },
        { value: 'callout_success', text: 'callout_success' },
        { value: 'callout_warning', text: 'callout_warning' },
        { value: 'callout_danger', text: 'callout_danger' }
      ]
    }
  },
  {
    id: 'transform',
    type: 'select',
    edit_options: {
      source: [
        { value: undefined, text: 'none' },
        { value: 'sum', text: 'sum' },
        { value: 'min', text: 'min' },
                                  { value: 'max', text: 'max' },
        { value: 'mean', text: 'mean' }
      ]
    }
  }
])
