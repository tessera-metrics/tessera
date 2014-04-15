var cronenberg = {

    fullscreen: false,

    /**
     * Constants for the various custom events cronenberg uses.
     */
    events:
    {
        ENTER_FULL_SCREEN: 'enter-fullscreen',
        EXIT_FULL_SCREEN:  'exit-fullscreen',
        DATA_AVAILABLE:    'data-available',
        DASHBOARD_LOADED:  'dashboard-loaded'
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
        if (!this.fullscreen) {
            console.log("cronenberg.enterFullscreen()");
            $("[data-fullscreen]=hide").hide(400);
            $("[data-fullscreen]=show").show()
            bean.fire(this, cronenberg.events.ENTER_FULL_SCREEN);
            this.fullscreen = true;
        }
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
        if (this.fullscreen) {
            console.log("cronenberg.exitFullscreen()");
            $("[data-fullscreen]=show").hide(400)
            $("[data-fullscreen]=hide").show()
            bean.fire(this, cronenberg.events.EXIT_FULL_SCREEN);
            this.fullscreen = false;
        }
        return this;
    },
};
