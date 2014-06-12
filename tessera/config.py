DEBUG                      = True
DEFAULT_FROM_TIME          = '-3h'
DEFAULT_THEME              = 'light'
DASHBOARD_APPNAME          = 'Tessera'
SQLALCHEMY_DATABASE_URI    = 'sqlite:///tessera.db'
GRAPHITE_URL               = 'http://graphite.prod.urbanairship.com'
SERVER_ADDRESS             = '0.0.0.0'
SERVER_PORT                = 5000
INTERACTIVE_CHARTS_DEFAULT = True
INTERACTIVE_CHARTS_RENDERER = 'nvd3'
DASHBOARD_RANGE_PICKER = [
      ('Past Hour', '-1h'),
      ('Past 3 Hrs', '-3h'),
      ('Past 12 Hrs', '-12h'),
      ('Past Day', '-1d'),
      ('Past Wk', '-1w'),
      ('Past 2 Wks', '-2w'),
]
