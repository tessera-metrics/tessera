import * as logging   from './core/log'
import * as charts    from './charts/core'
import * as factory   from './models/items/factory'
import * as app       from './app/app'
import * as edit      from './edit/edit'
import { actions }    from './core/action'
import { transforms } from './models/transform/transform'
import manager        from './app/manager'
import Config         from './app/config'
import GraphiteChartRenderer    from './charts/graphite'
import FlotChartRenderer        from './charts/flot'
import PlaceholderChartRenderer from './charts/placeholder'

declare var window, $

var log = logging.logger('main')

window.ts.app = app
window.ts.manager = manager
window.ts.charts = charts
window.ts.factory = factory
window.ts.actions = actions
window.ts.edit = edit
window.ts.transforms = transforms
app.config = window.ts.config

function setup(config: Config) {
  log.info('Registering chart renderers')
  charts.renderers.register(new GraphiteChartRenderer({
    graphite_url: config.GRAPHITE_URL
  }))
  charts.renderers.register(new FlotChartRenderer())
  // charts.renderers.register(new PlaceholderChartRenderer())
  log.info('Done.')
}

setup(app.config)
