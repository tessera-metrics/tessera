import { manager } from '../app'
import * as models from '../models'
import { logger } from '../core'

declare var URL

const log = logger('importer.graphite')

function translate(dash: any) : models.Dashboard {
  let columns = 3
  let span    = 12 / columns

  console.log(dash)

  return new models.Dashboard({ title: 'test' })
}

export function import_dashboard(url: string) : Promise<any> {

  // Translate from the UI URL to an API URL
  let uri     = new URI(url)
  let name    = uri.fragment()
  let api_uri = new URI().host(uri.host()).segment(['dashboard', 'load', name])

  log.info(`Importing dashboard from ${api_uri}...`)

  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'GET',
      url: api_uri.toString(),
      dataType: 'json',
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
