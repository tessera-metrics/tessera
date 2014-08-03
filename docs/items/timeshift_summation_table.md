---
layout: docs
title: Time-Shifted Summation Table
category: Documentation
doc_section: Item Types
---

The `timeshift_summation_table` dashboard item displays a query's
summation alongside the summation of the same query shifted back in
time with Graphite's `timeShift()` function, calculating and
displaying the delta.

### Attributes

|---
| Attribute | Default Value | |
|-:|:-|
| `title` | | |
| `format` | `,.3s` | |
| `shift` | `1d` | |
| `striped` | `false` | |
| `include_sums` | `false` | If `true`, the raw sum of each data series will be include in the table.  |
| `query` | | |
{: .table .attributes }

### Example 1

![](1day-striped.png){: .img-bordered}

{% highlight json %}
{% endhighlight %}

### Example 2

![](1week-plain.png){: .img-bordered}

{% highlight json %}
{% endhighlight %}
