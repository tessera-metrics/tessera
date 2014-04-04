<!-- render_chart ---------------------------------------------------------------- -->
{% macro render_chart(entity, options={}, height=150) -%}
{% set id = entity_selector(entity) %}
  <div id="chart-container{{id}}" style="height:{{height}}px" class="chart-container">
    <div id="name-overlay{{id}}"></div>
    <div id="value-overlay{{id}}"></div>
    <div id="chart{{id}}" style="height:{{height}}px"></div>
  </div>

<script>
// Hack alert, but it works
var True = true;
var False = false;

  chart = opendash.time_series_chart()
    .url("{{entity_uri(entity, 'data', format='flot') + '&' + request.query_string}}")
    .container("#chart{{id}}")
    .legend(false)
    .y_label("{{options.get('y_label', '')}}")
    .line_width({{options.get('line_width', 1)}})
    .stack({{options.get('stack', 'false')}})
    .type("{{options.get('chart_type', 'line')}}");
  chart.options().grid.borderColor = "#333";
  chart.call();
</script>
{%- endmacro %}


<!-- render_simple_chart --------------------------------------------------------- -->
{% macro render_simple_chart(entity, height=60) -%}
{% set id = entity_selector(entity) %}

<div class="simple-chart" id="chart-container{{id}}" style="height:{{height}}px">
  <div class="chart" id="chart{{id}}" style="height:{{height}}px"></div>
  <div class="name-overlay" id="name-overlay{{id}}"><h5>{{entity_name(entity)}}</div>
  <div class="value-overlay" id="value-overlay{{id}}"><h3></h3></div>
</div>

<script>
    chart = time_series_chart()
    .url("{{entity_uri(entity, 'data')}}")
    .container("#chart{{id}}")
    .type("area")
    .grid(false)
    .legend(false)
    .dataHandler(function(data) {
                     $("#value-overlay{{id}} h3").text(
                         opendash.format_kmbt(data[0].data[data[0].data.length-1][1])
                         );
                     return data;
                 })
    .line_width(1);
//chart.options().colors = ["#99AA99"];
chart.options().grid.borderColor = "#333";
chart.call();
</script>

{%- endmacro %}
