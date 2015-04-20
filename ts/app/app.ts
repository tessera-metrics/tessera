/**
 * The central application object. At present, its primary
 * responsibility is to handle switching between different application
 * modes, which is mainly about hiding & showing various elements in
 * the UI.
 */
ds.app =
  (function() {

    var mode_stack = []
      , ANIMATION_DELAY = 300
      , self = {}
      , log = ds.log.logger('tessera.app')

    /**
     * Some pre-defined events that we can register handlers for.
     */
    self.Event = {
      MODE_ENTER:         'ds-enter:',
      MODE_EXIT:          'ds-exit:',
      MODE_REFRESH:       'ds-refresh:',
      DASHBOARD_LOADED:   'ds-dashboard-loaded',
      DASHBOARD_RENDERED: 'ds-dashboard-rendered',
      RANGE_CHANGED:      'ds-range-changed',
      QUERIES_COMPLETE:   'ds-queries-complete'
    }

    /* =============================================================================
       Mode Handling
       ============================================================================= */

    self.current_mode = 'standard'

    /**
     * Valid user interface modes.
     */
    self.Mode = {
      EDIT:      'edit',
      TRANSFORM: 'transform',
      DISPLAY:   'display',
      STANDARD:  'standard'
    }

    function do_exit_mode(mode) {
      if (log.is_enabled(ds.log.Level.DEBUG)) {
        log.debug('mode <- ' + mode)
      }
      ds.event.fire(self, self.Event.MODE_EXIT + mode)
      var state = mode_stack.pop()
      if (state) {
        state.hidden.show(ANIMATION_DELAY)
        state.shown.hide(ANIMATION_DELAY)
      }
    }

    function do_enter_mode(mode) {
      if (log.is_enabled(ds.log.Level.DEBUG)) {
        log.debug('mode -> ' + mode)
      }
      var hidden = $('[data-ds-hide~="' + mode + '"]').hide(ANIMATION_DELAY)
      var shown = $('[data-ds-show~="' + mode + '"]').show(ANIMATION_DELAY)

      self.current_mode = mode
      mode_stack.push({
        mode: mode,
        hidden: hidden,
        shown: shown
      })
      ds.event.fire(self, self.Event.MODE_ENTER + mode)
    }

    /**
     * An alias for switch_to_mode(current_mode)
     */
    self.refresh_mode = function() {
      self.switch_to_mode(self.current_mode, 0)
      ds.event.fire(self, self.Event.MODE_REFRESH + self.current_mode)
      return self
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
    self.switch_to_mode = function(mode, delay) {
      delay = typeof(delay) === 'undefined' ? ANIMATION_DELAY : delay
      if (mode === self.current_mode && mode_stack.length > 0) {
        var state = mode_stack[mode_stack.length - 1]
        state.hidden = $('[data-ds-hide~="' + mode + '"]').hide(delay)
        state.shown = $('[data-ds-show~="' + mode + '"]').show(delay)
      } else {
        do_exit_mode(self.current_mode)
        do_enter_mode(mode)
      }
      return self
    }

    /**
     * Toggle between the named mode and 'standard'. Return true if
     * we've switched to mode, otherwise false if we've switched back
     * to 'standard'.
     *
     * @param mode {string} A mode name
     * @return true if switched to mode, else false
     */
    self.toggle_mode = function(mode) {
      if (self.current_mode == mode) {
        self.switch_to_mode(self.Mode.STANDARD)
        return false
      } else {
        self.switch_to_mode(mode)
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
    self.add_mode_handler = function(mode, options) {
      if (options.enter && (options.enter instanceof Function)) {
        ds.event.on(self, self.Event.MODE_ENTER + mode, options.enter)
      }
      if (options.exit && (options.exit instanceof Function)) {
        ds.event.on(self, self.Event.MODE_EXIT + mode, options.exit)
      }
      if (options.refresh && (options.refresh instanceof Function)) {
        ds.event.on(self, self.Event.MODE_REFRESH + mode, options.refresh)
      }
      return self
    }

    /* =============================================================================
       Miscellany
       ============================================================================= */

    // This should go somewhere more logical - it doesn't really have
    // anything to do with the app object.
    self.get_perf_stats = function() {
      var stats = new Object()
      stats.charts_render = ds.charts.perf.summarize_measures("render")

      var queries = ds.manager.current.dashboard.definition.queries
      var query_data = Object.keys(ds.manager.current.dashboard.definition.queries).map(function(key) {
                         return queries[key].performance_data()
                       })
      stats.query_load = ds.perf.mixin(query_data.map(function(d) {
                                    return d.load ? d.load.duration : 0
                                  }))
      stats.query_summarize = ds.perf.mixin(query_data.map(function(d) {
                                         return d.summarize ? d.summarize.duration : 0
                                       }))
      stats.query_convert = ds.perf.mixin(query_data.map(function(d) {
                                       return d.convert ? d.convert.duration : 0
                                     }))
      stats.query_total = ds.perf.mixin(query_data.map(function(d) {
                                     return (d.convert ? d.convert.duration : 0)
                                          + (d.summarize ? d.summarize.duration : 0)
                                          + (d.load ? d.load.duration : 0)
                                   }))

      return stats
    }

    return self
  })()
