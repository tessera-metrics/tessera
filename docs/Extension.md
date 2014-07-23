# Extending Tessera

Extensions are Javascript code that extend the UI of Tessera, by
defining new dashboard items, transformations, or toolbar/context menu
actions. Extensions can be added to a build of Tessera by simply
dropping a `.js` file in the `js/extensions` folder and running
`grunt`.

## Dashboard Items

### `ds.register_dashboard_item(type, descriptor)`

Registers a new dashboard item type.

#### Arguments

* `type` A string identifying the class of dashboard item.
* `descriptor` An object which supplies the Javascript model type, data handler callback, rendering template, and editable properties.

#### Example

Below is an incomplete, made-up example. Every built-in dashboard item
type is set up using `register_dashboard_item`, so you can look at all
the source files in
[js/models/dashboard-items](../js/models/dashboard-items) as examples
as well.

```javascript
ds.register_dashboard_item('my_item', {

  /**
   * Required - construct a new model object from JSON data.
   */
  constructor: function(data) {

    var self = limivorous.observable()
               .property('my_prop')
               .extend(ds.models.item, {item_type: 'my_item'})
               .build()
    if (data) {
      self.my_prop = data.my_prop
    }
    ds.models.item.init(self, data)

    self.toJSON = function() {
      return ds.extend(ds.models.item.json(self), {
        my_prop: self.my_prop
      })
    }

    return self
  },

  /**
   * Optional - will be called after the query's data has been
   * loaded. The 'self' constructed above will be passed in as 'item'.
   */
  data_handler: function(query, item) {
  },

  /**
   * Required. Can be a Handlebars template as a string, precompiled,
   * or any function that takes the item as an argument and return
   * HTML.
   */
  template: "{{my_prop}}",

  /**
   * Editable properties
   */
  interactive_properties: [
    'my_prop'
  ].concat(ds.models.item.interactive_properties)
})
```

## Transforms

Transforms are model objects implementing a `transform()` method which
accepts a dashboard item and returns a new dashboard item to replace
it.

## Actions

Actions are model objects that encapsulate an some execution that can
be invoked from the UI. Actions can be rendered as buttons or menu
items, and are registered globally in named lists which are used in
various places in the UI.

An action can specify its display text, an icon, its callback
function, and a variety of other display-related properties.

Here's an example which adds a "View Source..." menu item to the
dashboard list, opening the dashboard's API representation in a new
browser window.

```javascript
ds.actions.register('dashboard-list-actions',
                    ds.action({
                      name: 'view-source',
                      display: 'View Source...',
                      icon: 'fa fa-code',
                      handler: function(action, context) {
                        window.open(context.href + '?definition=true')
                      }
                    })
                   )
```

### Action Registry

The global action registry is accessed through `ds.actions`, which
supports the following functions.

* `ds.actions.register(category, action)`
* `ds.actions.list(category)`
* `ds.actions.get(category, name)`
* `ds.actions.categories()`

The following categories are pre-defined for various menus and button
bars in the UI:

* `'new-item'`
* `'edit-bar-section'`
* `'edit-bar-row'`
* `'edit-bar-cell'`
* `'edit-bar-item'`
* `'dashboard-queries'`
* `'dashboard-list-actions'`
* `'presentation-actions'`
