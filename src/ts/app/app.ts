import * as logging from '../core/log'
import events from '../core/event'
import Config from './config'

declare var $, URI, window

const log             = logging.logger('app')
const ANIMATION_DELAY = 300

export var config = new Config()

/**
 * Some pre-defined events that we can register handlers for.
 */
export const Event = {
  MODE_ENTER:         'ds-enter:',
  MODE_EXIT:          'ds-exit:',
  MODE_REFRESH:       'ds-refresh:',
  DASHBOARD_LOADED:   'ds-dashboard-loaded',
  DASHBOARD_RENDERED: 'ds-dashboard-rendered',
  RANGE_CHANGED:      'ds-range-changed',
  QUERIES_COMPLETE:   'ds-queries-complete'
}

/**
 * Valid user interface modes.
 */
export const Mode = {
  EDIT:      'edit',
  TRANSFORM: 'transform',
  DISPLAY:   'display',
  STANDARD:  'standard'
}

interface ModeStackEntry {
  mode:   string,
  hidden: any, // jQuery
  shown:  any  // jQuery
}

export interface IModeHandlerOptions {
  enter?: (e?: any) => void
  exit?: (e?: any) => void
  refresh?: (e?: any) => void
}

/**
 * The central application object. At present, its primary
 * responsibility is to handle switching between different application
 * modes, which is mainly about hiding & showing various elements in
 * the UI.
 */
export class Application {
  mode_stack : ModeStackEntry[]
  current_mode: string

  constructor() {
    this.mode_stack = []
    this.current_mode = 'standard'
  }

  /* Mode Handling ------------------------------------------ */

  _do_exit_mode(mode: string) : void {
    if (log.is_enabled(logging.Level.DEBUG)) {
      log.debug('mode <- ' + mode)
    }
    events.fire(this, Event.MODE_EXIT + mode)
    let state = this.mode_stack.pop()
    if (state) {
      state.hidden.show(ANIMATION_DELAY)
      state.shown.hide(ANIMATION_DELAY)
    }
  }

  _do_enter_mode(mode: string) : void {
    if (log.is_enabled(logging.Level.DEBUG)) {
      log.debug('mode -> ' + mode)
    }
    let hidden = $('[data-ds-hide~="' + mode + '"]').hide(ANIMATION_DELAY)
    let shown = $('[data-ds-show~="' + mode + '"]').show(ANIMATION_DELAY)

    this.current_mode = mode
    this.mode_stack.push({
      mode: mode,
      hidden: hidden,
      shown: shown
    })
    events.fire(this, Event.MODE_ENTER + mode)
  }

  /**
   * An alias for switch_to_mode(current_mode)
   */
  refresh_mode() : Application {
    this.switch_to_mode(this.current_mode, 0)
    events.fire(this, Event.MODE_REFRESH + this.current_mode)
    return this
  }

  /**
   * Switch to a named mode. This will first run the exit handlers
   * for the current mode, restoring any previously hidden elements
   * to visibility, before running the enter mode handlers for the
   * new mode and changing element visibility for the new mode.
   *
   * If the requested mode is already the current mode, the mode
   * will be 'refreshed' by re-evaluating what elements are hidden &
   * shown.
   *
   * @param mode {string} A mode name
   */
  switch_to_mode(mode: string, delay: number = ANIMATION_DELAY) : Application {
    if (mode === this.current_mode && this.mode_stack.length > 0) {
      let state = this.mode_stack[this.mode_stack.length - 1]
      state.hidden = $('[data-ds-hide~="' + mode + '"]').hide(delay)
      state.shown = $('[data-ds-show~="' + mode + '"]').show(delay)
    } else {
      this._do_exit_mode(this.current_mode)
      this._do_enter_mode(mode)
    }
    return this
  }

  /**
   * Toggle between the named mode and 'standard'. Return true if
   * we've switched to mode, otherwise false if we've switched back
   * to 'standard'.
   *
   * @param mode {string} A mode name
   * @return true if switched to mode, else false
   */
  toggle_mode(mode: string) : boolean {
    if (this.current_mode == mode) {
      this.switch_to_mode(Mode.STANDARD)
      return false
    } else {
      this.switch_to_mode(mode)
      return true
    }
  }

  /**
   * Register handlers to run on entrance to and/or exit from an
   * application mode.
   *
   * @param options An object with one or both of 'enter' and 'exit'
   *                attributes bound to functions which will be run
   *                on mode transitions.
   */
  add_mode_handler(mode: string, options: IModeHandlerOptions) : Application {
    if (options.enter && (options.enter instanceof Function)) {
      events.on(this, Event.MODE_ENTER + mode, options.enter)
    }
    if (options.exit && (options.exit instanceof Function)) {
      events.on(this, Event.MODE_EXIT + mode, options.exit)
    }
    if (options.refresh && (options.refresh instanceof Function)) {
      events.on(this, Event.MODE_REFRESH + mode, options.refresh)
    }
    return this
  }
}

export const instance = new Application()

/* Compatibility interface ------------------------------------------ */

export function refresh_mode() : Application {
  return instance.refresh_mode()
}

export function switch_to_mode(mode: string, delay: number = ANIMATION_DELAY) : Application {
  return instance.switch_to_mode(mode, delay)
}

export function toggle_mode(mode: string) : boolean {
  return instance.toggle_mode(mode)
}

export function add_mode_handler(mode: string, options) : Application {
  return instance.add_mode_handler(mode, options)
}

/* Miscellany ------------------------------------------------------- */

export function uri(path: string) {
  return config.APPLICATION_ROOT
    ? config.APPLICATION_ROOT + path
    : path
}

/**
 * Return a context object based on the current URL.
 */
export function context(context?: any) : any {
  context = context || {}
  let url       = new URI(window.location)
  let params    = url.query(true)
  let variables : any = {}

  context.from = params.from || config.DEFAULT_FROM_TIME
  context.until = params.until

  for (let key in params) {
    /* compatibility w/gdash params */
    if (key.indexOf('p[') == 0) {
      let name = key.slice(2, -1)
      variables[name] = params[key]
    } else {
      variables[key] = params[key]
    }
  }

  variables.path = url.path()
  context.path = url.path()
  context.variables = variables
  context.params = params

  return context
}
