# Tasks

### Build/Organization

- integrate some proper JS build-fu to minify and compress all the
  javascript, etc...
- _Grunt_
  - ~~Precompile client side templates with
    [grunt-contrib-handlebars](https://github.com/gruntjs/grunt-contrib-handlebars)~~
  - [ ] Compile CSS from LESS with
    [grunt-contrib-less](https://github.com/gruntjs/grunt-contrib-less)
  - ~~Files can be extracted from bower with
    [grunt-bower](https://www.npmjs.org/package/grunt-bower)~~
  - [ ] More sophisticated javascript concatenation + minification can be
    done with
    [grunt-contrib-uglify](https://github.com/gruntjs/grunt-contrib-uglify)
- or _[Gulp](http://gulpjs.com/)_
  - [gulp-handlebars](https://www.npmjs.org/package/gulp-handlebars)
  - [browserify-handlebars](https://www.npmjs.org/package/browserify-handlebars)

### Optimization

- consider moving to graphite's raw text protocol
- [ ] integrate
  [handlebars-async](https://www.npmjs.org/package/handlebars-async)
  which will be useful when we need to fetch data from clusto for
  templates.

### Model & Persistence

- Thresholds
  - Attach them to queries, not presentations
  - if a threshold is triggered, update ALL presentations linked to it
- [ ] Transforms (pka Drilldowns)
  - [ ] They should be entities in the model
  - [ ] each transform defines how to generate the new display
    - from a single graph to the same graph on multiple time scales
    - or breaking out a multi-host chart into one chart per host
    - or simple link to another dashboard
    - Presentations can have more than one transform
- add standard deviation to summation model
- only dashboards are named entities right now. Presentations should
  *optionally* be named entities, so they can be reused between
  dashboards w/o duplication (ditto queries).
  - templatized presentations should also be named entities
  - that requires queries to be (optionally) named entities too, since
    they're independent of presentations
  - groups (such as sections, see below) are probably the most useful
    form of shared building-block.
  - UPDATE: Now that dashboards are also dashboard-items, dashboard is
    already effectively a unit of named reuse. No real need to have a
    separate unit. Hooray for consistent models.

### API

- [ ] custom error views for API that return proper API responses
- [ ] Refactor how from_json() works, maybe a metaclass or somesuch, to
  cut down on the janky dispatching. UPDATE: With the model existing on the client side now, the server side implementation is likely to disappear soon. 
- [x] element_id doesn't need to be stored; just generate unique element
  IDs in expanded API view. Current method has chance for collisions.

### Presentations

- New presentations
  - [ ] ``SummationComparisonTable``, compare 2 series w/% change indicator (see stathat)
  - [ ] ``ComparisonSingleStat`` - compare a single summation number between two metrics (i.e. this week & last) w/%change as the primary value shown. Show actual A/B numbers smaller
  - [ ] For very compact dashboards summarizing lots of metrics, could use simple [bootstrap badges](http://getbootstrap.com/components/#badges) for a
    singlestat value, plus actual mini sparklines
  - [ ] multi-stat version of ``SingleStat`` that flips through them using a
    carousel (i.e. [Slick](http://kenwheeler.github.io/slick) which is
    the......slickest carousel I've found yet).
  - nvd3 can do combination area/line graphs
    (such as [jquery.sparkline](http://omnipotent.net/jquery.sparkline/#s-about)).
  - [ ] [reD3](http://bugzu.github.io/reD3/) has an interesting [day/hour heatmap](http://bugzu.github.io/reD3/#/heatmap)
  - [punchcard](https://github.com/fogleman/Punchcard) is similar, implementing a github-style punchcard view. In python, so server-side.
  - [dc.js](http://nickqizhu.github.io/dc.js/) with [crossfilter](http://square.github.io/crossfilter/).
  - [ ] nvd3: [multi-bar](http://nvd3.org/examples/multiBar.html) option for time series
  - [ ] nvd3: has an [excellent implementation](http://nvd3.org/examples/bullet.html) of
    Stephen Few's [bullet graph](http://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf).
  - horizon graphs with [Cubism](http://square.github.io/cubism/)
- Updates to existing presentations
  - [ ] 2nd Y axis support
    - existing options should change from yAxisLabel, yAxisThis, yAxisThat to an array of axis options
  - [ ] allow selection of which columns are display in ``SummationTable``
  - [ ] ``JumboTronSinglestat`` is a hack. A properly responsive presentation
    that scales w/size of parent would rock.
  - [x] threshold to automatically switch to graphite rendering for long
  time windows (SVG rendering in browser gets slow). UPDATE: This is largely rendered irrelevant by the existing static/dynamic switch, and defaulting to static rendering
  - [ ] more options for time formatting
  - [ ] tabbed dashboard sections (not as useful as auto-flipping carousel for bigboard displays)

### Actions/Drilldowns

- [x] Action menu
  - [x] chart.io has the same thing
    [see live demo](https://chartio.com/project/9258/dash/10832/?gf162633_start=2014-03-27&gf162633_end=2014-04-26&gf2241_start=2012-W41&gf2241_end=2013-W19)
    but the menu appears on mouseover. shouldn't be hard to do for
    cronenberg too, since the menu is actually in a div that's outside
    the charts (shouldn't conflict w/chart events)
    - [x] Simple option is just show them in regular view, and hide them in fullscreen
- [x] create some demo dashboards with drilldown explorations
  - time shifting
    - ``SummationComparisonTable`` will be a good one to add for that
  - percentile expansion
  - moving averages/medians
  - mostDeviant
  - scan obfuscurity's blog and teh int3rwebz for interesting graphite tricks that could be automated

### Editing

- [ ] display count of queries
- [ ] display count of presentations
- [ ] basic info updates (title, category, tags)
- [ ] add notifications confirming delete (or update, etc...)
- [ ] Grafana's [javascript parser for graphite queries](https://github.com/torkelo/grafana/tree/master/src/app/services/graphite) could be useful

### UI

- Investigate [react](http://facebook.github.io/react/)
  - [Why you might not need MVC with React](http://www.code-experience.com/why-you-might-not-need-mvc-with-reactjs/)
- Add option to include a graph on the front page - something like our
  carbon metrics, on the state of the graphite system itself
- ~~add option for readable slugs in UI URLs~~
- custom error views (for 404, etc...)
- integrate a **notification/alert** lib for error messages & general notifications.
    - [messenger](http://github.hubspot.com/messenger/docs/welcome/)
    - [bootstrap-growl](http://bootstrap-growl.remabledesigns.com/)
    - [pnotify](http://sciactive.com/pnotify/)
    - [bootstrap-notify](https://github.com/goodybag/bootstrap-notify)
- custom **date-time range picker**
  - [bootstrap-datetimepicker](https://github.com/Eonasdan/bootstrap-datetimepicker)
    looks very nice, fits well with bootstrap 3.
- configuration for the recent time ranges shown in the easy picker
- user preferences page
  - default auto-refresh period
  - ~~color theme~~
  - recent time ranges
  - whether action menus are shown by default or not
- Grid alternatives. Other ways of laying out the dashboard grid, as an alternative to the
  bootstrap CSS grid. Some of these are interactive, with possibilities for editing.
  - [Nested](http://suprb.com/apps/nested/)
  - [uberVU grid](https://github.com/uberVU/grid)
  - [gridster.js](https://github.com/ducksboard/gridster.js)
  - [jquery.shapeshift](https://github.com/McPants/jquery.shapeshift)
- other themes, like [Solarized](http://ethanschoonover.com/solarized).

### Navigation

- Drilldowns - define links from individual presentations to other
  dashboards, or to larger presentations (i.e. a generic dashboard
  page that shows a single presentation from the parent scaled up)

### Demos

- Add chef runs to single node overview

### Integration

- LDAP integration
  - persistent sessions based on login
  - user preferences
- ~~import of gdash dashboards. Hmm - gdash has no API. So, not likely.~~


# Done
-----------------------------------------------------------------------------

#### Optimization

- ~~In non-interactive graph mode, don't evaluate the raw data queries
  if there are no textual presentations~~

#### Model & Persistence

- ~~more sophisticated persistence (i.e. SQLAlchemy or somesuch) that
  would allow tagging and searching by tag~~
- ~~add support for multi-valued queries (graphite URL api supports
  multiple values for target). Will help with graphite dashboard
  importing~~
- ~~Persistence for model objects via cask~~

#### API

- ~~accept inline definition in POST /api/dashboard~~
- ~~refactor API to a flask blueprint to reuse for different model
  classes~~ Update: nah, maybe not. API surface area is small, and hand-tuning is good.
- ~~queries should be dumped to JSON without graphite hostname or
  format=json in URL. Need a render_url_path w/o format or host~~
- ~~basic API for dashboards~~

#### Presentations

  - ~~[tasseo](https://github.com/obfuscurity/tasseo)-style simple graphs (combination of a
    singlestat and simple_time_series with fill)~~
  - ~~pie/donut chart needs some CSS tweaking for dark mode~~
  - ~~thresholds for alert colors (i.e. turn value in singlestat yellow/orange/red)~~
  - ~~dashboard sections. Section = separator + heading + rows, collapsible (click on heading)~~
- ~~titles~~
- ~~donut/pie charts~~
- ~~replace use of jquery.number with d3.format. No need to carry around
  two number formatters.~~
- ~~height needs to be a first-class attribute, not just smashed into css_class~~
- ~~min/max/mean/total datatable - see
  [stathat](http://blog.stathat.com/2014/04/09/web-app-interface-changes-stats.html)
  for a nice example (and a
  [rundown of the components used](http://blog.stathat.com/2014/04/10/whats-powering-the-new-web-interface.html)).~~
- ~~axis labels~~
- ~~Lists of presentations per cell~~
- ~~text presentations. Just put some formatted text in a grid Cell for
  explanation. Render markdown with
  [markdown.js](https://github.com/evilstreak/markdown-js) or
  [showdown.js](https://github.com/coreyti/showdown). ~~Alternatively,
  here's a [flask snippet](http://flask.pocoo.org/snippets/19/) for
  rendering markdown server-side.~~
      - ~~[Flask-Misaka](https://flask-misaka.readthedocs.org/en/latest/)
        looks even better. Presentation template would just be
        {{item.text|markdown}}~~

#### Actions/Drilldowns

- ~~Add action menu to some presentations~~
  - ~~replace graphite SVG export w/D3 SVG~~
  - ~~have a single function for graphite render URL that dispatches on item type~~
  - ~~Hide in fullscreen~~
  - ~~Open in Graphite Composer~~
    - ~~take the render URL and replace ``/render`` with ``/composer`` and remove ``format=json``~~


#### Editing

- ~~Update dashboard list~~
  - ~~display dashboard counts in tag selector~~
  - ~~render client side~~
  - ~~better presentation (2 lines per entry, title, last modified time)~~
  - ~~action menu on each row, to delete or duplicate (or others)~~
- ~~Client-side rendering. Not strictly needed for creating an editor, but preferable.~~
  - ~~passing complex options to javascript code is clumsy using server side templates~~
  - ~~needed for dynamic editing~~
  - ~~depends on API~~
  - ~~API depends on persistence~~
  - ~~tentative candidate is [Handlebars](http://handlebarsjs.com/)~~
    - ~~probably need to define a block helper for render dispatching
      based on presentation type. Don't think Handlebars has callable
      macros like jinja2.~~

#### UI

- ~~static vs. interactive images as default~~
  - ~~currently a little simplistic; the toggle on the dashboard page
    should not change the session's persistent setting~~
- ~~[bootbox](http://bootboxjs.com/) could potentially remove a lot of markup for modals~~
- ~~auto-refresh~~
- ~~refresh button~~
- ~~Add a 'full screen' button that removes everything except the
  dashboard grid from the view (and a 'back' button to restore it)~~
  - ~~already have ``cronenberg.enterFullScreen()`` and
    ``cronenberg.exitFullScreen()`` APIs with events. UI bits just
    need to register for those events to hide/show.~~
  - ~~alternatively, just use data-attributes for fullscreen hide/show~~
  - ~~drop-down version of the range picker menu, to save space~~
  - ~~In full-screen, put the title, range picker, current time, and
    exit fullscreen button all on one line~~
- ~~dark/light theme switching~~
  - ~~session persistence~~

#### Navigation

- ~~Featured dashboards on front page are currently hard-coded. They should be driven from metadata
  (need to add metadata to back-end first; probably by adding in a SQL datastore)~~
- ~~Tags. Produce a related dashboards list based on common tags (also requires metadata store)~~

#### Integration

- ~~import of graphite built-in dashboards~~
- ~~start with anonymous, non-persistent sessions. ~~
- ~~excise dependence on toolbox's graphite classes entirely (partway there already) ~~

#### Third Party Components

- ~~upgrade to bootstrap3 (darkstrap support is only unofficial and
  incomplete so far - see
  [here](https://github.com/danneu/darkstrap/issues/17))~~
- ~~upgrade to jQuery 1.11~~

#### Bugs

- ~~yAxis labels. probably a JS scoping issue. Nope, it was Python.~~
- ~~hover! Why do the tables all have hover backgrounds when I haven't
  specified class="table-hover", and why is the background in dark
  mode excessively light?~~
- ~~bottom margin on graphs has disappeared. wtf?~~
  - ~~it's the dashboard-height classes. NVD3 renders the svg taller
    than them, so they get clipped. Remove the height classes after
    rendering? patch nvd3?~~
