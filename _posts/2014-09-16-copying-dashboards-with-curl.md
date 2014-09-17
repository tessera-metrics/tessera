---
layout: post
title: "Copying Dashboards with curl"
date: 2014-09-16 18:00:00
category: Blog
tags: tidbits
---

It's likely that at some point you're going to want to copy a
dashboard from one instance of Tessera to another. You might have an
instance running in staging, and you need to copy a new dashboard from
staging to production.

I frequently prototype new dashboards in an instance of Tessera
running from my local development tree, then copy them to the staging
or production server when they're ready.

Because the UI is powered entirely by a REST API, it's a simple matter
to do this with your favorite command line HTTP tool, such as
[`curl`](http://curl.haxx.se).

All you have to do is issue a `GET` to retrieve the full definition of
the dashboard from the source instance, and pipe that to another
`curl` command executing a `POST` on the target instance.

Here's an example:

~~~bash
curl --get -d "definition=true" http://localhost:5000/api/dashboard/35 \
    | curl -X POST --header "Content-Type: application/json" \
      -d @- http://dashboards.prod.urbanairship.com/api/dashboard/
~~~

This fetches the dashboard with id `35` from my local instance,
including the full definition, and pipes it to a `POST` on our main
Tessera instance, taking the body of the post from standard input. Be
sure to set the `Content-Type` header to `application/json`.

The response will give you URI paths for both the API and UI
representations of the new dashboard on the target instance.

~~~json
{
    "dashboard_href": "/api/dashboard/206",
    "view_href": "/dashboards/206/alpern-scratch"
}
~~~
