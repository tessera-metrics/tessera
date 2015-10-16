declare var ts, bootbox
import manager from '../manager'
import Action, { actions } from '../../core/action'
import * as graphite from '../../charts/graphite'

actions.register('presentation-actions', [
  new Action({
    name: 'view-query',
    display: 'View query...',
    icon: 'fa-question',
    handler: (action, item) => {
      let query = item.query_override || item.query
      let expr  = query.targets[0]
      let source = `### Query: ${item.query.name}

\`\`\`
${expr}
\`\`\`
`
      bootbox.alert(ts.templates.edit.view_query({ source: source }))
    }
  }),
  new Action({
    name:    'open-in-graphite',
    display: 'Open in Graphite...',
    icon:    'fa-bar-chart-o',
    handler: function(action, item) {
      let composer_url = graphite.composer_url(item, item.query_override || item.query, {
        showTitle: true
      })
      window.open(composer_url.href())
    }
  }),
  new Action({
    name:    'export-png',
    display: 'Export PNG...',
    icon:    'fa-file-image-o',
    handler: function(action, item) {
      let image_url = graphite.chart_url(item, item.query_override || item.query, {
        showTitle: true
      })
      window.open(image_url.href())
    }
  }),
  new Action({
    name:    'export-svg',
    display: 'Export SVG...',
    icon:    'fa-file-code-o',
    handler: function(action, item) {
      let image_url = graphite.chart_url(item, item.query_override || item.query, {
        showTitle: true,
        format: 'svg'
      })
      window.open(image_url.href())
    }
  }),
  new Action({
    name:    'export-csv',
    display: 'Export CSV...',
    icon:    'fa-file-excel-o',
    handler: function(action, item) {
      let image_url = graphite.chart_url(item, item.query_override || item.query, {
        showTitle: true,
        format: 'csv'
      })
      window.open(image_url.href())
    }
  })
])

$(document).on('click', 'ul.ds-action-menu li', function(event) {

  let presentation_id = $(this).parent().parent().parent().parent().parent()[0].id
  let item = manager.current.dashboard.get_item(presentation_id)

  let action = actions.get(this.getAttribute('data-ds-category'), this.getAttribute('data-ds-action'))
  action.handler(action, item)

  /* prevents resetting scroll position */
  return false
})
