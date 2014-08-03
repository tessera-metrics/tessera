---
layout: docs
title: Summation Table
category: Documentation
doc_section: Item Types
---


### Attributes

|---
| Attribute | Default Value | |
|-:|:-|
| `title` | | |
| `format` | `,.3s` | |
| `striped` | `false` | |
| `include_sums` | `false` | If `true`, the raw sum of each data series will be include in the table.  |
| `query` | | |
{: .table .attributes }

### Example 1

![](stripes.png){: .img-bordered}

{% highlight json %}
{
  "item_type": "summation_table",
  "item_id": "d153",
  "query": "positive",
  "format": ",.3s",
  "striped": true,
  "title": "With stripes"
}
{% endhighlight %}

### Example 2

![](no-stripes.png){: .img-bordered}

{% highlight json %}
{
  "item_type": "summation_table",
  "item_id": "d155",
  "query": "positive",
  "format": ",.3s",
  "title": "No stripes"
}
{% endhighlight %}
