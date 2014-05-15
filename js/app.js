ds.app =
  (function() {
    var mode_stack = []
      , self = {}

    self.current_mode = 'standard'

    self.Mode = {
      EDIT:      'edit',
      TRANSFORM: 'transform',
      DISPLAY:   'display',
      STANDARD:  'standard'
    }

    var ANIMATION_DELAY = 300

    function do_exit_mode(mode) {
      bean.fire(self, 'ds-exit:' + mode)
      var state = mode_stack.pop()
      if (state && state.cleanup && (state.cleanup instanceof Function)) {
        console.log('running cleanup for ' + mode)
        state.cleanup()
      }
    }

    function do_enter_mode(mode) {
      var hidden = $('[data-ds-hide~="' + mode + '"]').hide(ANIMATION_DELAY)
      var shown = $('[data-ds-show~="' + mode + '"]').show(ANIMATION_DELAY)

      self.current_mode = mode
      mode_stack.push({
        mode: mode,
        cleanup: function() {
          console.log('Showing ' + hidden.length )
          hidden.show(ANIMATION_DELAY)
          console.log('Hiding ' + shown.length )
          shown.hide(ANIMATION_DELAY)
        }
      })
      bean.fire(self, 'ds-enter:' + mode)
    }

    self.switch_to_mode = function(mode) {
      do_exit_mode(self.current_mode)
      do_enter_mode(mode)
      return self
    }

    self.add_mode_handler = function(mode, options) {
      console.log('add_mode_handler ' + mode + ', ' + options)
      if (options.enter && (options.enter instanceof Function)) {
        console.log('adding enter handler')
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

    editing: false,

    ANIMATION_DELAY: 300,

    /**
     * Constants for the various custom events cronenberg uses.
     */
    events:
    {
        DATA_AVAILABLE:       'ds-data-available',
        DASHBOARD_LOADED:     'ds-dashboard-loaded',
        RANGE_CHANGED:        'ds-range-changed'
    },

    toggleEditMode: function() {
      if (ds.app.current_mode !== 'edit') {
        ds.app.switch_to_mode('edit')
        return true
      } else {
        ds.app.switch_to_mode('standard')
        return false
      }
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
