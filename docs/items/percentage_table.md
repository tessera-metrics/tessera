---
layout: docs
title: Percentage Table
category: Documentation
doc_section: Item Types
---


### Attributes

|---
| Attribute | Default Value | |
|-:|:-|
| `title` | | |
| `format` | `,.3s` | |
| `include_sums` | `false` | If `true`, the raw sum of each data series will be include in the table.  |
| `query` | | |
{: .table .attributes }

### Example 1

![](percentage.png){: .img-bordered}

{% highlight json %}
{
  "item_type": "percentage_table",
  "item_id": "d141",
  "query": "percentages",
  "format": "%",
  "title": "Percentages Only"
}
{% endhighlight %}

### Example with Sums

![](sums.png){: .img-bordered}

{% highlight json %}
{
  "item_type": "percentage_table",
  "item_id": "d143",
  "query": "percentages",
  "format": ",.3s",
  "title": "Including Sums",
  "include_sums": true
}
{% endhighlight %}
