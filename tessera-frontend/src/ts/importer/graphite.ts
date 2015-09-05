import { manager, config } from '../app'
import * as models from '../models'
import { logger } from '../core'
import * as charts from '../charts'

declare var URL, inflection

const log = logger('importer.graphite')

function translate(gdash: any, opt : any = {}) : models.Dashboard {
  return manager.without_updates(() => {
    let columns = opt.columns || 3
    let span = 12 / columns

    let section = new models.Section()
    let definition = new models.DashboardDefinition({
      items: [section]
    })

    let dash = new models.Dashboard({
      title: inflection.dasherize(gdash.name),
      category: 'Graphite',
      tags: ['imported'],
      definition: definition
    })

    let row = new models.Row()
    for (let graph of gdash.graphs) {
      let [targets, options, render_url] = graph
      let is_stacked = render_url.indexOf('stacked') > -1 || (options.areaMode && options.areaMode === 'stacked')
      let query_name = 'q' + Object.keys(definition.queries).length
      let query = new models.Query({
        name: query_name,
        targets: options.target || []
      })
      definition.add_query(query)

      let presentation = new models.StackedAreaChart({
        query: query,
        title: options.title,
        stack_mode: is_stacked ? charts.StackMode.NORMAL : charts.StackMode.NONE,
        options: {
          y1: {
            label: options.vtitle,
            max: options.yMax,
            min: options.yMin
          },
          palette: options.template
        }
      })

      row.add(new models.Cell({
        span: span,
        items: [presentation]
      }))

      if (row.items.length === columns) {
        section.add(row)
        row = new models.Row()
      }
    }

    if (row && row.items && row.items.length) {
      section.items.push(row)
    }

    return dash
  })
}

/**
 * Translate from a Graphite dashboard UI URL to an API URL to load
 * the JSON definition.
 */
export function get_api_url(dash_url: string) : string {
  let uri = new URI(dash_url)
  return uri.segment('load')
    .segment(uri.fragment())
    .fragment(null)
    .toString()
}

/**
 * Fetch a Graphite dashboard definition, convert it to a Tessera
 * dashboard definition, and upload it to the Tessera server via the
 * API.
 */
export function import_dashboard(url: string) : Promise<any> {
  let api_url = get_api_url(url)
  log.info(`Importing dashboard from ${api_url}...`)

  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'GET',
      url: api_url.toString(),
      dataType: 'json',
      beforeSend: (xhr) => {
        if (config.GRAPHITE_AUTH !== '') {
          xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(config.GRAPHITE_AUTH))
        }
      },
      success: (data) => {
        resolve(data.state)
      },
      error: (request, status, error) => {
        reject({request, status, error})
      }
    })
  }).then(translate)
    .then(dash => {
      return manager.client.dashboard_create(dash)
        .then(response => {
          return response
        })
        .catch((request, status, error) => {
          manager.error(`Error creating dashboard. ${error}`)
        })
    })
}
