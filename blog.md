---
layout: page
title: Blog
category: Blog
permalink: /blog/
---

<div class="container">

{% for post in site.posts %}
    {% include blogpreview.html %}
{% endfor %}

</div>
