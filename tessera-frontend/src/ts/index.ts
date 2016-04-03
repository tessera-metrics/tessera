import 'babel-polyfill'

import * as core      from './core'
import * as charts    from './charts/core'
import * as factory   from './models/items/factory'
import * as app       from './app/app'
import * as edit      from './edit/edit'
import * as importer  from './importer'
import Client         from './client'
import { actions }    from './core/action'
import { transforms } from './models/transform/transform'
import User           from './models/user'
import { extend }     from './core/util'
import manager        from './app/manager'
import Config         from './app/config'
import GraphiteChartRenderer    from './charts/graphite'
import FlotChartRenderer        from './charts/flot'
import PlaceholderChartRenderer from './charts/placeholder'
import { register_helpers } from './app/helpers'
import { register_dashboard_item } from './models/items/factory'
import * as items from './models/items'

declare var window, $

var log = core.logger('main')

window.ts.init = function() {
  let config = window.ts.config

  core.extend(window.ts, {
    core: core,
    app: app,
    manager: manager,
    charts: charts,
    factory: factory,
    actions: actions,
    edit: edit,
    transforms: transforms,
    importer: importer,
    user: new User()
  })
  app.config = window.ts.config

  /* Set up the API client */
  window.ts.client
    = manager.client
    = new Client({ prefix: config.APPLICATION_ROOT })

  /* Register all dashboard items */
  register_dashboard_item(items.DashboardDefinition)
  register_dashboard_item(items.Section)
  register_dashboard_item(items.Row)
  register_dashboard_item(items.Cell)
  register_dashboard_item(items.Markdown)
  register_dashboard_item(items.Heading)
  register_dashboard_item(items.Separator)
  register_dashboard_item(items.SummationTable)
  register_dashboard_item(items.PercentageTable)
  register_dashboard_item(items.TimeshiftSummationTable)
  register_dashboard_item(items.ComparisonSummationTable)
  register_dashboard_item(items.Singlestat)
  register_dashboard_item(items.TimeshiftSinglestat)
  register_dashboard_item(items.ComparisonSinglestat)
  register_dashboard_item(items.JumbotronSinglestat)
  register_dashboard_item(items.TimeshiftJumbotronSinglestat)
  register_dashboard_item(items.ComparisonJumbotronSinglestat)
  register_dashboard_item(items.Timerstat)
  register_dashboard_item(items.DonutChart)
  register_dashboard_item(items.BarChart)
  register_dashboard_item(items.DiscreteBarChart)
  register_dashboard_item(items.SimpleTimeSeries)
  register_dashboard_item(items.StandardTimeSeries)
  register_dashboard_item(items.StackedAreaChart)
  register_dashboard_item(items.Singlegraph)
  register_dashboard_item(items.SinglegraphGrid)

  /* Register Handlebars helper functions */
  register_helpers()

  /* Register chart renderers */
  charts.renderers.register(new GraphiteChartRenderer({
    graphite_url: config.GRAPHITE_URL
  }))
  charts.renderers.register(new FlotChartRenderer())
}
