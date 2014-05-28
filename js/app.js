ds.app =
  (function() {
    var mode_stack = []
      , ANIMATION_DELAY = 300
      , self = {}

    self.current_mode = 'standard'

    self.Mode = {
      EDIT:      'edit',
      TRANSFORM: 'transform',
      DISPLAY:   'display',
      STANDARD:  'standard'
    }

    function do_exit_mode(mode) {
      bean.fire(self, 'ds-exit:' + mode)
      var state = mode_stack.pop()
      if (state) {
        state.hidden.show(ANIMATION_DELAY)
        state.shown.hide(ANIMATION_DELAY)
      }
    }

    function do_enter_mode(mode) {
      var hidden = $('[data-ds-hide~="' + mode + '"]').hide(ANIMATION_DELAY)
      var shown = $('[data-ds-show~="' + mode + '"]').show(ANIMATION_DELAY)

      self.current_mode = mode
      mode_stack.push({
        mode: mode,
        hidden: hidden,
        shown: shown
      })
      bean.fire(self, 'ds-enter:' + mode)
    }

    /**
     * An alias for switch_to_mode(current_mode)
     */
    self.refresh_mode = function() {
      self.switch_to_mode(self.current_mode)
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
     */
    self.switch_to_mode = function(mode) {
      if (mode === self.current_mode && mode_stack.length > 0) {
        var state = mode_stack[mode_stack.length - 1]
        state.hidden = $('[data-ds-hide~="' + mode + '"]').hide(ANIMATION_DELAY)
        state.shown = $('[data-ds-show~="' + mode + '"]').show(ANIMATION_DELAY)
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

    self.add_mode_handler = function(mode, options) {
      if (options.enter && (options.enter instanceof Function)) {
        bean.on(self, 'ds-enter:' + mode, options.enter)
      }
      if (options.exit && (options.exit instanceof Function)) {
        bean.on(self, 'ds-exit:' + mode, options.exit)
      }
      return self
    }

    return self
  })()

var cronenberg = {

    /**
     * Constants for the various custom events cronenberg uses.
     */
    events:
    {
        DATA_AVAILABLE:       'ds-data-available',
        DASHBOARD_LOADED:     'ds-dashboard-loaded',
        RANGE_CHANGED:        'ds-range-changed'
    },

    check_thresholds: function(item, value, element) {
        if (item.thresholds) {
            if (value > item.thresholds.danger) {
                $(element).addClass("dashboard-danger bs-callout bs-callout-danger");
            } else if (value > item.thresholds.warning) {
              $(element).addClass("dashboard-warning bs-callout bs-callout-warning");
            }
        }
    }
};
