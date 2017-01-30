---
layout: docs
title: Comparison Summation Table
category: Documentation
doc_section: Text
---


### Attributes

|---
| Attribute | Default Value | |
|-:|:-|
| `title` | | |
| `format` | `,.3s` | |
| `shift` | `1d` | |
| `striped` | `false` | |
| `query` | | |
| `query_other` | | |
{: .table .attributes }

### Example

![](example.png){: .img-bordered}

{% highlight json %}
{
  "item_type": "comparison_summation_table",
  "item_id": "d166",
  "format": ",.3s",
  "striped": true,
  "query": "comp1",
  "query_other": "comp2"
}
{% endhighlight %}
