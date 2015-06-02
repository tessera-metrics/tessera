While Tessera has a lot of custom code on the front end, it's been
built with as many "off-the-shelf" components as possible.

### Third-Party Code ###

**Server Side**

* [Flask](http://flask.pocoo.org/)
* [Flask-SQLAlchemy](http://pythonhosted.org/Flask-SQLAlchemy/)
* [Flask-Migrate](https://github.com/miguelgrinberg/Flask-Migrate)
* [SLQAlchemy](http://www.sqlalchemy.org/)
* [requests](https://github.com/kennethreitz/requests)
* [inflection](https://github.com/jpvanhal/inflection)
* [invoke](https://github.com/pyinvoke/invoke)

**Client Side**

* [Bootstrap](http://getbootstrap.com/)
  * [Font Awesome](http://fortawesome.github.com/Font-Awesome/)
  * [darkstrap](https://github.com/danneu/darkstrap)
  * The extracted
    [callouts](https://gist.github.com/matthiasg/6153853) from
    bootstrap's documentation site.
  * [bootbox](http://bootboxjs.com/) simplifies modal dialog interactions.
  * [bootstrap-validator](http://bootstrapvalidator.com/). This is now
    [formvalidation.io](https://github.com/formvalidation/), and
    appears to no longer have an OSS compatible license (the version
    included here is MIT licensed).
  * [bootstrap-growl](https://github.com/mouse0270/bootstrap-growl)
  * [bootstrap-datetimepicker](https://github.com/Eonasdan/bootstrap-datetimepicker)
* [jQuery](http://jquery.com/)
* [d3](http://d3js.org). d3 is used for value formatting in text and
  for stacked graph layout.
* [flot](http://www.flotcharts.org/) is used for interactive chart
  rendering.
  * [flot-axislabels](https://github.com/mikeslim7/flot-axislabels)
  * [flot-valuelabels](https://github.com/winne27/flot-valuelabels)
  * [flot.multihighlight](https://github.com/eugenijusr/flot.multihighlight)
  * [flot-barnumbers-enhanced](https://github.com/jasonroman/flot-barnumbers-enhanced)
  * [flot-d3-stack](https://github.com/aalpern/flot-d3-stack/)
  * [flot-downsample](https://github.com/sveinn-steinarsson/flot-downsample/)
* [DataTables](http://datatables.net/)
* [moment.js](http://momentjs.com/) for time parsing & formatting.
  * [moment-timezone.js](http://momentjs.com/timezone/)
* [bean.js](https://github.com/fat/bean) for events.
* [handlebars.js](http://handlebarsjs.com/) for client side templating.
* [marked](https://github.com/chjj/marked) for Markdown support.
* [highlight.js](http://highlightjs.org/)
* [URI.js](https://github.com/medialize/URI.js) for URL manipulation.
* [limivorous](https://github.com/aalpern/limivorous)
* [tagmanager](https://github.com/max-favilli/tagmanager)
* [x-editable](http://vitalets.github.io/x-editable/)
* [color](https://github.com/harthur/color)
* [mousetrap](https://github.com/ccampbell/mousetrap)
* [simple-statistics](https://github.com/tmcw/simple-statistics)
* [equalize.js](https://github.com/tsvensen/equalize.js/)
* [usertiming.js](https://github.com/nicjansma/usertiming.js) provides
  polyfill of the W3 [User Timing](http://www.w3.org/TR/user-timing/)
  API for browsers that don't support it natively (i.e. Safari 8).
* [node-inflection](https://github.com/dreamerslab/node.inflection)
* [HumanizeDuration](https://github.com/EvanHahn/HumanizeDuration.js)
* [filejaver.js](https://www.npmjs.com/package/filesaver.js)
