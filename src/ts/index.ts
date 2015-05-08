import * as logging from './core/log'
import * as charts  from './charts/core'
import * as factory from './models/items/factory'
import * as app     from './app/app'
import GraphiteChartRenderer    from './charts/graphite'
import FlotChartRenderer        from './charts/flot'
import PlaceholderChartRenderer from './charts/placeholder'
import manager from './app/manager'
import Config  from './app/config'

declare var window, $, tessera

var log = logging.logger('main')

// Temporary, for compatibility with old templates
window.ts.app = app
window.ts.manager = manager
window.ts.templates = tessera.templates
window.ts.charts = charts
window.ts.factory = factory
app.config = window.ts.config

function setup(config: Config) {
  log.info('Registering chart renderers')
  charts.renderers.register(new GraphiteChartRenderer({
    graphite_url: config.GRAPHITE_URL
  }))
  charts.renderers.register(new FlotChartRenderer())
  charts.renderers.register(new PlaceholderChartRenderer())
  log.info('Done.')
}

setup(app.config)
