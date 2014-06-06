/**
 * A simple registry for organizing and retrieving sets of actions to
 * populate menus and toolbars in the UI.
 */
ds.actions =
  (function() {
    "use strict"

    var actions = {}
      , self = {}

    function get_actions(category) {
      if (typeof(actions[category]) === 'undefined') {
        actions[category] = {
          list: [],
          index: {}
        }
      }
      return actions[category]
    }

    self.register = function(category, action) {
      if (action instanceof Array) {
        for (var i in action) {
          self.register(category, action[i])
        }
      } else {
        var a = get_actions(category)
        if (typeof(a.index[action.name]) === 'undefined') {
          a.index[action.name] = action
        }
        a.list.push(action)
      }
      return self
    }

    self.list = function(category) {
      return get_actions(category).list
    }

    self.get = function(category, name) {
      return get_actions(category).index[name]
    }

    return self

  })()
