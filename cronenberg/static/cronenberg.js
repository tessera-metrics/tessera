var cronenberg = {

    fullscreen: false,
    editing: false,

    ANIMATION_DELAY: 300,

    /**
     * Constants for the various custom events cronenberg uses.
     */
    events:
    {
        ENTER_FULL_SCREEN: 'ds-enter-fullscreen',
        EXIT_FULL_SCREEN:  'ds-exit-fullscreen',
        ENTER_EDIT_MODE:   'ds-enter-edit-mode',
        EXIT_EDIT_MODE:    'ds-exit-edit-mode',
        DATA_AVAILABLE:    'ds-data-available',
        DASHBOARD_LOADED:  'ds-dashboard-loaded',
        RANGE_CHANGED:     'ds-range-changed'
    },

    /**
     * Register an event handler for entering fullscreen mode.
     */
    onEnterFullscreen: function(handler) {
        bean.on(this, cronenberg.events.ENTER_FULL_SCREEN, handler);
        return this;
    },

    /**
     * Enter full screen mode.
     */
    enterFullscreen: function() {
        $("[data-fullscreen=hide]").hide(this.ANIMATION_DELAY);
        $("[data-fullscreen=show]").show(this.ANIMATION_DELAY)
        bean.fire(this, cronenberg.events.ENTER_FULL_SCREEN);
        this.fullscreen = true;
        return this;
    },

    enterEditMode: function() {
        $("[data-edit-mode=hide]").hide(this.ANIMATION_DELAY);
        $("[data-edit-mode=show]").show(this.ANIMATION_DELAY)
        bean.fire(this, cronenberg.events.ENTER_EDIT_MODE);
        this.editing = true;
        return this;
    },

    /**
     * Register an event handler for exiting fullscreen mode.
     */
    onExitFullscreen: function(handler) {
        bean.on(this, cronenberg.events.EXIT_FULL_SCREEN, handler);
        return this;
    },

    /**
     * Exit full screen mode.
     */
    exitFullscreen: function() {
        $("[data-fullscreen=show]").hide(this.ANIMATION_DELAY)
        $("[data-fullscreen=hide]").show(this.ANIMATION_DELAY)
        bean.fire(this, cronenberg.events.EXIT_FULL_SCREEN);
        this.fullscreen = false;
        return this;
    },

    exitEditMode: function() {
        $("[data-edit-mode=show]").hide(this.ANIMATION_DELAY)
        $("[data-edit-mode=hide]").show(this.ANIMATION_DELAY)
        bean.fire(this, cronenberg.events.EXIT_EDIT_MODE);
        this.editing = false;
        return this;
    },

    toggleEditMode: function() {
        if (this.editing) {
            this.exitEditMode();
        } else {
            this.enterEditMode();
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
