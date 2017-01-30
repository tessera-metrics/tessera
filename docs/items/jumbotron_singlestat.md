---
layout: docs
title: Jumbotron Singlestat
category: Documentation
doc_section: Text
---

The `jumbotron_singlestat` dashboard item presents a single numeric value from
the summation of a data series, rendered in a large format.

### Attributes

|---
| Attribute | Default Value | |
|-:|:-|
| `title` | | |
| `units` | | |
| `format` | `,.3s` | |
| `transform` | `mean` | One of the Summation fields - `sum`, `min`, `max`, `mean`, `median`, `first`, `last`, or `count` |
| `query` | | |
| `index` | | |
{: .table .attributes }

### Example

![](plain.png)
![](well.png)

{% highlight json %}
{
  "item_type": "jumbotron_singlestat",
  "item_id": "d11",
  "query": "single_big",
  "title": "Median Latency",
  "format": ",.3s",
  "transform": "median",
  "units": "ms"
}
{% endhighlight %}
