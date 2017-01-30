---
layout: docs
title: Simple Time Series
category: Documentation
doc_section: Charts
---

### Attributes

|---
| Attribute | Default Value | |
|-:|:-|
| `title` | | |
| `filled` | `false` | |
| `query` | | |
{: .table .attributes }

### Example 1

![](example1.png){: .img-bordered}

{% highlight json %}
{
  "filled": false,
  "item_type": "simple_time_series",
  "item_id": "d10",
  "query": "single1",
  "height": 1
}
{% endhighlight %}

### Example 2

![](example2.png){: .img-bordered}

{% highlight json %}
{
  "filled": true,
  "item_type": "simple_time_series",
  "item_id": "d11",
  "query": "single1",
  "height": 1,
  "title": "Filled"
}
{% endhighlight %}
