---
layout: docs
title: Standard Time Series
category: Documentation
doc_section: Charts
---

The `standard_time_series` dashboard item renders full-featured line
and area charts, with multiple options for formatting, stacking, and
legends.

![](standard-time-series.png)

### Attributes

|---
| Attribute | Default Value | |
|-:|:-|
| **title** | | |
| **query** | | |
| **legend** | `simple` | `simple` or `table` or `none`|
| **stack_mode** | `none` | `stacked` or `stream` or `percent` or `none`|
{: .table .attributes }

### Series Rendering Options

#### Lines Only

{% highlight json %}
{
    "show_lines": true,
    "show_points": false
}
{% endhighlight %}

![](lines-only.png)

#### Points Only

{% highlight json %}
{
    "show_lines": false,
    "show_points": true
}
{% endhighlight %}

![](points-only.png)

#### Lines and Points

{% highlight json %}
{
    "show_lines": true,
    "show_points": true
}
{% endhighlight %}

![](points-and-lines.png)

### Legend Options

#### None

{% highlight json %}
{
    "legend": "none"
}
{% endhighlight %}

#### Simple

{% highlight json %}
{
    "legend": "simple"
}
{% endhighlight %}

![](legend-simple.png)

#### Table

{% highlight json %}
{
    "legend": "table"
}
{% endhighlight %}

![](legend-table.png)

### Stacking Options

#### None

{% highlight json %}
{
    "stack_mode": "none"
}
{% endhighlight %}

![](stack-none.png)

#### Stacked

{% highlight json %}
{
    "stack_mode": "stack"
}
{% endhighlight %}

![](stack-normal.png)

#### Stream

{% highlight json %}
{
    "stack_mode": "stream"
}
{% endhighlight %}

![](stack-stream.png)

#### Percent

{% highlight json %}
{
    "stack_mode": "percent"
}
{% endhighlight %}

![](stack-percent.png)
