---
layout: docs
title: Donut Chart
category: Documentation
doc_section: Item Types
---

They were just sucked into space. Some days you get the bear, and some
days the bear gets you. This should be interesting. Yes, absolutely, I
do indeed concur, wholeheartedly! Maybe we better talk out here; the
observation lounge has turned into a swamp. I guess it's better to be
lucky than good.

### Attributes

|---
| Attribute | Default Value | |
|-:|:-|
| `title` | | |
| `query` | | |
{: .table .attributes }

### Example 1

![](example1.png){: .img-bordered}

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

![](example2.png){: .img-bordered}

{% highlight json %}
{
  "item_type": "example",
  "item_id": "d155",
  "query": "positive",
  "format": ",.3s",
  "title": "No stripes"
}
{% endhighlight %}
