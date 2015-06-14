import json
from flask import request, session, Response
from .application import app
from tessera_client.api.model import EntityEncoder

def _get_param(name, default=None, store_in_session=False):
    """Retrieve a named parameter from the request, falling back to the
session. If store_in_session is True, the value will be stored in the
session.
    """
    value = request.args.get(name) or session.get(name, default)
    if store_in_session:
        session[name] = value
    return value

def _get_param_boolean(name, default=None, store_in_session=False):
    value = _get_param(name, default)
    if store_in_session:
        session[name] = value
    return value == 'True' \
        or value == 'true'

def _cfg(key, default=None):
    return app.config.get(key, default)

def _get_preferences(store_in_session=False):
    """Retrieve a dictionary containing all user preferences, obtained
from (in order) the request parameters, session, and config
defaults.
    """
    return {
        'downsample'                  : _get_param('downsample',       _cfg('DOWNSAMPLE_TIMESERIES', 1), store_in_session=store_in_session),
        'theme'                       : _get_param('theme',            _cfg('DEFAULT_THEME', 'light'), store_in_session=store_in_session),
        'renderer'                    : _get_param('renderer',         _cfg('CHART_RENDERER', 'flot'), store_in_session=store_in_session),
        'refresh'                     : _get_param('refresh',          _cfg('DEFAULT_REFRESH_INTERVAL', 60), store_in_session=store_in_session),
        'timezone'                    : _get_param('timezone',         _cfg('DISPLAY_TIMEZONE', 'Etc/UTC'), store_in_session=store_in_session),
        'graphite_url'                : _get_param('graphite_url',     _cfg('GRAPHITE_URL', 'http://localhost:8080'), store_in_session=store_in_session),
        'graphite_auth'               : _get_param('graphite_auth',    _cfg('GRAPHITE_AUTH', ''), store_in_session=store_in_session),
        'connected_lines'             : _get_param('connected_lines',  _cfg('CONNECTED_LINES', _cfg('GRAPHITE_CONNECTED_LINES', 0)), store_in_session=store_in_session),
        'propsheet_autoclose_seconds' : _get_param('propsheet_autoclose_seconds', _cfg('DEFAULT_PROPSHEET_AUTOCLOSE_SECONDS', 3), store_in_session=store_in_session),
        'default_from_time'           : _get_param('default_from_time', _cfg('DEFAULT_FROM_TIME', '-3h'), store_in_session=store_in_session),
    }

def _set_preferences(prefs):
    """Store multiple key/value pairs in the session."""
    for name, value in prefs.items():
        session[name] = value

def _jsonify(data, status=200, headers=None):
    response = Response(status=status,
                        mimetype="application/json",
                        response=json.dumps(data, cls=EntityEncoder, sort_keys=True))
    if isinstance(headers, dict):
        for key, value in headers.items():
            response.headers[key] = str(value)
    return response

def _set_exception_response(http_exception):
    http_exception.response = _jsonify({
        'error_message' : http_exception.description
    }, status=http_exception.code)
    return http_exception
