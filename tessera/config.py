DEBUG                      = True
SECRET_KEY                 = 'REPLACE ME'
DEFAULT_FROM_TIME          = '-3h'
DEFAULT_THEME              = 'light'
DASHBOARD_APPNAME          = 'Tessera'
SQLALCHEMY_DATABASE_URI    = 'sqlite:///tessera.db'
MIGRATION_DIR              = 'migrations'
GRAPHITE_URL               = 'http://localhost:8080'
GRAPHITE_AUTH              = ''
DISPLAY_TIMEZONE           = 'Etc/UTC'
SERVER_ADDRESS             = '0.0.0.0'
SERVER_PORT                = 5000
CHART_RENDERER             = 'flot'
DOWNSAMPLE_TIMESERIES      = 1 # 1 for true, 0 for false
DEFAULT_PROPSHEET_AUTOCLOSE_SECONDS = 3

DASHBOARD_RANGE_PICKER = [
      ('1h',  '-1h'),
      ('3h',  '-3h'),
      ('12h', '-12h'),
      ('1d',  '-1d'),
      ('3d',  '-3d'),
      ('1w',  '-1w'),
      ('2w',  '-2w'),
      ('3w',  '-3w'),
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
