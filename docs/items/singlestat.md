---
layout: docs
title: Singlestat
category: Documentation
doc_section: Text
---

The `singlestat` dashboard item presents a single numeric value from
the summation of a data series.

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
  "item_type": "singlestat",
  "item_id": "d9",
  "query": "single_big",
  "title": "Median Latency",
  "format": ",.3s",
  "transform": "median",
  "units": "ms"
}
{% endhighlight %}
