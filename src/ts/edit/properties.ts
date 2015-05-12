import { properties } from '../core/property'
import manager from '../app/manager'

/*
 * Register a bunch of editable properties that are used by many
 * dashboard items.
 */
properties.register([
  {
    name: 'title',
    category: 'base'
  },
  {
    name: 'height',
    category: 'base',
    type: 'select',
    edit_options: {
      source: [
        { value: undefined, text: 'default' }, 1, 2, 3, 4, 5, 6, 7, 8
      ],
      update: function(item, value) {
        if (value) {
          item.set_height(Number(value))
        }
      }
    }
  },
  {
    name:     'query',
    category: 'base',
    template: '{{item.query.name}}',
    edit_options: {
      type: 'select',
      source: function() {
        var queries = manager.current.dashboard.definition.queries
        return Object.keys(queries).map(function(k) {
                 return { value: k, text: k }
        })
      },
      value: function(item) {
        return item.query ? item.query.name : undefined
      },
      update: function(item, value) {
        item.set_query(value)
      }
    }
  },
  {
    name: 'query_other',
    category: 'base',
    template: '{{item.query_other.name}}',
    edit_options: {
      type: 'select',
      source: function() {
        var queries = manager.current.dashboard.definition.queries

        return Object.keys(queries).map(function(k) {
          return { value: k, text: k }
        })
      },
      value: function(item) {
        return item.query_other ? item.query_other.name : undefined
      }
    }
  },

  {
    name: 'style',
    type: 'select',
    edit_options: {
      source: [
        { value: undefined, text: 'none' },
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
    name: 'transform',
    type: 'select',
    edit_options: {
      source: [
        { value: undefined, text: 'default' },
        'sum',
        'min',
        'max',
        'mean',
        'median',
        'first',
        'last',
        'last_non_zero',
        'count'
      ]
    }
  }

])
