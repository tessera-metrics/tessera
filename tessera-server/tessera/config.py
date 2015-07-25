#
# Enables Flask's debug mode. Should not be True in production.
#
DEBUG                      = True

#
# Hash key for anonymous sessions. Replace this with a good random
# string, such as a UUID.
#
SECRET_KEY                 = 'REPLACE ME'

#
# The default 'from' time for graphite queries. When a dashboard is
# loaded with no from or until parameters in the URL, this will be
# used to select the time range to display.
#
DEFAULT_FROM_TIME          = '-3h'

#
# The default UI color theme. Valid values are 'light', 'dark',
# 'snow', 'solarized-light', and 'solarized-dark'. This is overridable
# by user sessions.
#
DEFAULT_THEME              = 'light'

#
# Displayed on the front page and in the footer of every page. If you
# have multiple installations of tessera, using a unique value for
# each one may be a good idea. Purely cosmetic.
#
DASHBOARD_APPNAME          = 'Tessera'

#
# A data base URL for dashboard storage. See
# http://docs.sqlalchemy.org/en/rel_0_9/core/engines.html
#
SQLALCHEMY_DATABASE_URI    = 'sqlite:///tessera.db'

#
# Directory for database migration scripts.
#
MIGRATION_DIR              = 'migrations'

#
# IP address to for the backend server to listen on.
#
SERVER_ADDRESS             = '0.0.0.0'

#
# TCP port for the backend server to listen on.
#
SERVER_PORT                = 5000

#
# URL to the graphite server to pull data from. This is overridable by
# user sessions.
#
GRAPHITE_URL               = 'http://localhost:8080'

#
# If your graphite server requires authentication, enter the auth
# string here. Only HTTP Basic authentication is supported - enter
# 'user:password' as required. This is overridable by user sessions.
#
GRAPHITE_AUTH              = ''

#
# Whether to render charts with lines between each consecutive non-null
# point.
# Connected line mode can be useful when your data is sparse, but it
# can also mask scalability problems with your Graphite installation.
#
CONNECTED_LINES            = 0

#
# The default renderer for charts. Valid values are 'graphite', for
# non-interactive charts, and 'flot'. The graphite renderer does not
# support the full range of visualizations, however. This is
# overridable by user sessions.
#
CHART_RENDERER             = 'flot'

#
# Global flag to enable or disable the downsampling of data in the
# flot renderer, which improves both rendering speed and clarity of
# the rendered charts when there are long time periods displayed. Use
# 1 to enable or 0 to disable.
#
DOWNSAMPLE_TIMESERIES      = 1

#
# Default time zone to display time stamps in. This is overridable by
# user sessions.
#
DISPLAY_TIMEZONE           = 'Etc/UTC'

#
# The default time period, in seconds, after which to automatically
# close dashboard item property sheets in edit mode. Use 0 to disable
# auto-close. This is overridable by user sessions.
#
DEFAULT_PROPSHEET_AUTOCLOSE_SECONDS = 3

#
# The set of intervals to be displayed in the recent time range
# picker.
#
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

#
# The set of entries in the dashboard refresh period menu.
#
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

#
# The default refresh time to automatically reload dashboards, in
# seconds. This is overridable by user sessions.
#
DEFAULT_REFRESH_INTERVAL = 60

#
# Enable Cross Origin Resource Sharing headers
#
ENABLE_CORS = False

#
# Set the allowed origins for CORS, when enabled.
#
CORS_ORIGINS = '*'
