ds.edit.register_property([
  {
    id: 'offset', type: 'number'
  },
  {
    id: 'span', type: 'number'
  },
  {
    id: 'height', type: 'number'
  },
  {
    id: 'index', type: 'number'
  },
  {
    id: 'level', type: 'number'
  },
  {
    id: 'striped', type: 'boolean'
  },
  {
    id: 'filled', type: 'boolean'
  },
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
    id: 'align',
    type: 'select',
    edit_options: {
      source: [
        { value: undefined, text: 'none' },
        { value: 'left', text: 'left' },
        { value: 'center', text: 'center' },
        { value: 'right', text: 'right' }
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
  },
  {
    id: 'layout',
    type: 'select',
    edit_options: {
      source: [
        { value: 'fixed', text: 'fixed' },
        { value: 'fluid', text: 'fluid' },
        { value: 'none', text: 'none' }
      ]
    }
  },
  {
    id: 'query',
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
    id: 'markdown.text',
    name: 'text',
    type: 'textarea'
  }
])
