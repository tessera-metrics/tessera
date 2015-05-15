import * as logging   from './core/log'
import * as charts    from './charts/core'
import * as factory   from './models/items/factory'
import * as app       from './app/app'
import * as edit      from './edit/edit'
import { actions }    from './core/action'
import { transforms } from './models/transform/transform'
import { extend }     from './core/util'
import manager        from './app/manager'
import Config         from './app/config'
import GraphiteChartRenderer    from './charts/graphite'
import FlotChartRenderer        from './charts/flot'
import PlaceholderChartRenderer from './charts/placeholder'

declare var window, $

var log = logging.logger('main')

extend(window.ts, {
  app: app,
  manager: manager,
  charts: charts,
  factory: factory,
  actions: actions,
  edit: edit,
  transforms: transforms
})
app.config = window.ts.config

function setup(config: Config) {
  log.info('Registering chart renderers')
  charts.renderers.register(new GraphiteChartRenderer({
    graphite_url: config.GRAPHITE_URL
  }))
  charts.renderers.register(new FlotChartRenderer())
  log.info('Done.')
}

setup(app.config)
