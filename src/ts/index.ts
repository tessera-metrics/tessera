import * as core      from './core'
import * as charts    from './charts/core'
import * as factory   from './models/items/factory'
import * as app       from './app/app'
import * as edit      from './edit/edit'
import { Client }     from './client'
import { actions }    from './core/action'
import { transforms } from './models/transform/transform'
import User           from './models/user'
import { extend }     from './core/util'
import manager        from './app/manager'
import Config         from './app/config'
import GraphiteChartRenderer    from './charts/graphite'
import FlotChartRenderer        from './charts/flot'
import PlaceholderChartRenderer from './charts/placeholder'

declare var window, $

var log = core.logger('main')
const user = new User()


core.extend(window.ts, {
  core: core,
  app: app,
  manager: manager,
  charts: charts,
  factory: factory,
  actions: actions,
  edit: edit,
  transforms: transforms,
  user: user
})
app.config = window.ts.config
window.ts.client = new Client({ prefix: app.config.APPLICATION_ROOT })

function setup(config: Config) {
  charts.renderers.register(new GraphiteChartRenderer({
    graphite_url: config.GRAPHITE_URL
  }))
  charts.renderers.register(new FlotChartRenderer())
}

setup(app.config)
