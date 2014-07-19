DEBUG                      = True
SECRET_KEY                 = 'REPLACE ME'
DEFAULT_FROM_TIME          = '-3h'
DEFAULT_THEME              = 'light'
DASHBOARD_APPNAME          = 'Tessera'
SQLALCHEMY_DATABASE_URI    = 'sqlite:///tessera.db'
GRAPHITE_URL               = 'http://localhost:8080'
SERVER_ADDRESS             = '0.0.0.0'
SERVER_PORT                = 5000
APPLICATION_ROOT = '/tessera'
INTERACTIVE_CHARTS_DEFAULT = True
INTERACTIVE_CHARTS_RENDERER = 'nvd3'

DASHBOARD_RANGE_PICKER = [
      ('Past Hour',   '-1h'),
      ('Past 3 Hrs',  '-3h'),
      ('Past 12 Hrs', '-12h'),
      ('Past Day',    '-1d'),
      ('Past Wk',     '-1w'),
      ('Past 2 Wks',  '-2w'),
]

DASHBOARD_REFRESH_INTERVALS = [
    ('None',             0),
    ('30 seconds',      30),
    ('1 minute',        60),
    ('2 minutes',   2 * 60),
    ('5 minutes',   5 * 60),
    ('10 minutes', 10 * 60),
    ('30 minutes', 30 * 60),
    ('1 hour',     60 * 60)
]

DEFAULT_REFRESH_INTERVAL = 60
