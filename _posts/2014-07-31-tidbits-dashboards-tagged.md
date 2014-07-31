---
layout: post
title: "Tidbits: tagged dashboard lists"
date: 2014-07-31 12:00:00
category: Blog
author: Adam Alpern
tags: tidbits, markdown
---

One of the recent additions to Tessera is a
[handlebars](http://handlebarsjs.com/) helper to generate
Markdown-formatted lists of dashboards.

The `markdown` dashboard item is intended to add documentation and
hyperlinking capabilities (or [cats](http://i.imgur.com/KfcGG7Q.png)!)
to dashboards. I like adding a "Related Dashboards" item to high-level
dashboards, with links to more detailed dashboards.

The
[Overview Demo](https://github.com/urbanairship/tessera/blob/master/demo/demo-overview-demo.json)
dashboard that's included with Tessera has an example, which links to
the other dashboards which are tagged with the `demo` or `test` tags.

<img title="Related Dashboards" class="img-bordered" src="{{site.baseurl}}/images/tidbits/related-dashboards.png"/>


### dashboards-tagged

This is done with the help of the `dashboards-tagged` handlebars tag,
which takes a single tag name as an argument, and expands to a
Markdown list of links to all the dashboards with that tag.

The markdown text for that item looks like this:


<div class="bs-callout bs-callout-warning">
Note - please ignore the backslashes, they're an unfortunate problem
with the markdown processor that renders these pages.
</div>


~~~ markdown
#### Related Dashboards

\{\{dashboards-tagged "demo"}}

\{\{dashboards-tagged "test"}}
~~~
