import json
from flask import request, session, Response
from .application import app
from .client.api.model import EntityEncoder

def get_param(name, default=None, store_in_session=False):
    """Retrieve a named parameter from the request, falling back to the
session. If store_in_session is True, the value will be stored in the
session.
    """
    value = request.args.get(name) or session.get(name, default)
    if store_in_session:
        session[name] = value
    return value

def get_param_boolean(name, default=None, store_in_session=False):
    value = get_param(name, default)
    if store_in_session:
        session[name] = value
    return value == 'True' \
        or value == 'true'

def cfg(key, default=None):
    return app.config.get(key, default)

def get_preferences(store_in_session=False):
    """Retrieve a dictionary containing all user preferences, obtained
from (in order) the request parameters, session, and config
defaults.
    """
    return {
        'downsample'                  : get_param('downsample',       cfg('DOWNSAMPLE_TIMESERIES', 1), store_in_session=store_in_session),
        'theme'                       : get_param('theme',            cfg('DEFAULT_THEME', 'light'), store_in_session=store_in_session),
        'renderer'                    : get_param('renderer',         cfg('CHART_RENDERER', 'flot'), store_in_session=store_in_session),
        'refresh'                     : get_param('refresh',          cfg('DEFAULT_REFRESH_INTERVAL', 60), store_in_session=store_in_session),
        'timezone'                    : get_param('timezone',         cfg('DISPLAY_TIMEZONE', 'Etc/UTC'), store_in_session=store_in_session),
        'graphite_url'                : get_param('graphite_url',     cfg('GRAPHITE_URL', 'http://localhost:8080'), store_in_session=store_in_session),
        'graphite_auth'               : get_param('graphite_auth',    cfg('GRAPHITE_AUTH', ''), store_in_session=store_in_session),
        'connected_lines'             : get_param('connected_lines',  cfg('CONNECTED_LINES', cfg('GRAPHITE_CONNECTED_LINES', 0)), store_in_session=store_in_session),
        'propsheet_autoclose_seconds' : get_param('propsheet_autoclose_seconds', cfg('DEFAULT_PROPSHEET_AUTOCLOSE_SECONDS', 3), store_in_session=store_in_session),
        'default_from_time'           : get_param('default_from_time', cfg('DEFAULT_FROM_TIME', '-3h'), store_in_session=store_in_session),
    }

def set_preferences(prefs):
    """Store multiple key/value pairs in the session."""
    for name, value in prefs.items():
        session[name] = value

def jsonify(data, status=200, headers=None):
    response = Response(status=status,
                        mimetype="application/json",
                        response=json.dumps(data, cls=EntityEncoder, sort_keys=True))
    if isinstance(headers, dict):
        for key, value in headers.items():
            response.headers[key] = str(value)
    return response

def set_exception_response(http_exception):
    http_exception.response = jsonify({
        'error_message' : http_exception.description
    }, status=http_exception.code)
    return http_exception
