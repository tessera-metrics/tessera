var opendash = {};


opendash.id = function(entity) {
    var name = '';
    if ( typeof(entity) == "string" )
        name = entity;
    else
        name = entity.name;
    return name.replace(/\./g, '_');
};

// Borrowed from Rickshaw
opendash.format_kmbt = function(y) {
    value = y;
    suffix = '';
    if (y >= 1000000000000)   { value = y / 1000000000000; suffix = "T" }
    else if (y >= 1000000000) { value = y / 1000000000; suffix = "B" }
    else if (y >= 1000000)    { value = y / 1000000; suffix = "M" }
    else if (y >= 1000)       { value = y / 1000; suffix = "K" }
    else if (y < 1 && y > 0)  { value = y; }
    else if (y == 0)          { value = 0; }
    else                      { value = y }
    return value.toPrecision(3) + suffix;
};

opendash.time_series_chart = function() {

    var default_options = {
        colors: ['#ecb796','#dc8f70','#b2a470','#92875a','#716c49','#d2ed82','#bbe468','#a1d05d','#e7cbe6','#d8aad6','#a888c2','#9dc2d3','#649eb9','#387aa3'].reverse(),

        series: {
            lines: { show: true, lineWidth: 1, fill: false},
            stack: null,
            points: { show: false },
            bars: { show: false }
        },
        xaxis: {
            mode: "time",
            twelveHourClock: true,
            color: '#ccc',
            tickColor:'#333'
            // axisLabel: 'Time'
        },
        yaxes: [
            {
                tickFormatter: opendash.format_kmbt,
                reserveSpace: 30,
                labelWidth: 30,
                color: '#ccc',
                tickColor: '#333'
                // axisLabel: 'Things'
            },
            {
                tickFormatter: opendash.format_kmbt,
                color: '#ccc'
            }
        ],
        points: {
            show: false,
            radius: 2,
            symbol: "circle"
        },
        shadowSize: 0,
        legend: {
            container: null,
            noColumns: 2,
            position: 'nw',
            backgroundColor: 'transparent',
            labelBoxBorderColor: 'transparent'
        },
        grid: {
            borderWidth: 1,
            borderColor: "#AAAAAA",
            hoverable: true,
            clickable: true,
            autoHighlight: false,
            /* grid.color actually sets the color of the legend
             * text. WTH? */
            color: '#ccc'
        },
        selection: {
            mode: "x",
            color: "red"
        },
        multihighlight: {
            mode: "x"
        },
        crosshair: {
            mode: "x",
            color: "red",
            lineWidth: 1
        }
    };

    var plot = null;
    var data = null;
    var url  = '';
    var type = 'line';
    var container = '';
    var legend_container = '';
    var dataHandler = null;
    var enable_zoom = true;
    var series = null;


    function showTooltip(x, y, contents) {
        $('<div id="tooltip">' + contents + '</div>').css( {
            position: 'absolute',
            display: 'none',
            top: y + 5,
            left: x + 5
        }).appendTo("body").fadeIn(200);
    }

    function chart() {
        $(container).bind("plotselected", function (event, ranges) {
            if (enable_zoom) {
                var opt = default_options;
                plot = $.plot($(container), series,
                              $.extend(true, {}, opt, {
                                  xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to }
                              }));
            }
        });

        $(container).bind("multihighlighted", function(event, pos, items) {
            if ( !items )
                return;
            series = plot.getData();
            item = items[0];
            point = series[item.serieIndex].data[item.dataIndex];
            contents = "<span class='tooltip-time'>"
                + new Date(point[0]).toString()
                + '</span><hr/><table><tbody>';
            $.each(items, function(index, item) {
                ser = series[item.serieIndex];
                pair = ser.data[item.dataIndex];

                contents += ( "<tr>"
                              // Value
                              + "<td class='tooltip-value'>" + pair[1] + "</td>"

                              // Badge + name
                              + "<td class='tooltip-label'><span class='badge' style='background-color: "
                              + ser.color + "'><i class='icon-bolt'></i></span> "
                              + ser.label + "</td>"

                              + "</tr>"
                            );

            });
            contents += "</tbody></table>";

            $("#tooltip").remove();
            showTooltip(pos.pageX, pos.pageY, contents);
        });

        $(container).bind("unmultihighlighted", function(event) {
            $("#tooltip").remove();
        });


        if ( !data ) {
            // $(container).activity({segments:11, width:3, length:3, space:1});
            $.ajax({url:url,
                    type:"get",
                    accepts:"application/json",
                    dataType:"json",
                    error:function(request, status, error) {
                        // $(container).activity(false);
                        $(container).replaceWith("<div><h6>No Data</h6></div>");
                        $('.top-right').notify({
                            message: { text: 'Failed to load ' + url },
                            type: 'error'
                        }).show();
                    },
                    success:function(data, status, request) {
                        // $(container).activity(false);
                        series = data.data;
                        if ( dataHandler != null ) {
                            series = dataHandler(series);
                        }
                        plot = $.plot($(container), series, default_options);
                    }});
        } else {
            // $(container).activity(false);
            plot = $.plot($(container), data, default_options);
        }

        return chart;
    }

    function options() {
        return default_options;
    }

    chart.reload = function() {
        data = null;
        plot = null;
        chart();
        return chart;
    }

    chart.plot = function() {
        return plot;
    }

    chart.options = function() {
        return options();
    }

    chart.reset_zoom = function() {
        if ( plot == null )
            return;
        plot = null;
        chart();
        return chart;
    }

    chart.data = function(_) {
        if (!arguments.length) return data;
        data = _;
        if (plot != null)
            plot.setData(data);
        return chart;
    }

    chart.dataHandler = function(_) {
        if ( !arguments.length ) return dataHandler;
        dataHandler = _;
        return chart;
    }

    chart.enable_zoom = function(_) {
        if ( !arguments.length ) return enable_zoom;
        enable_zoom = _;
        return chart;
    }

    chart.url = function(_) {
        if ( !arguments.length ) return url;
        url = _;
        return chart;
    };

    chart.container = function(_) {
        if ( !arguments.length ) return container;
        container = _;
        return chart;
    }

    chart.stack = function(_) {
        if ( !arguments.length ) return options().series.stack;
        options().series.stack = _;
        return chart;
    };

    chart.legend = function(_) {
        if ( !arguments.length ) return options().legend.container;
        options().legend.container = _;
        return chart;
    }

    chart.line_width = function(_) {
        if ( !arguments.length ) return options().series.lines.lineWidth;
        options().series.lines.lineWidth = _;
        return chart;
    }

    chart.type = function(_) {
        if ( !arguments.length ) return type;
        type = _;
        opt = options();

        if ( type == 'line' ) {
            opt.series.lines.show  = true;
            opt.series.lines.fill  = false;
            opt.series.bars.show   = false;
            opt.series.points.show = false;
        } else if ( type == 'area' ) {
            opt.series.lines.show  = true;
            opt.series.lines.fill  = true;
            opt.series.bars.show   = false;
            opt.series.points.show = false;
        } else if ( type == 'bar' ) {
            opt.series.lines.show  = false;
            opt.series.lines.fill  = false
            opt.series.bars.show   = true;
            opt.series.points.show = false;
        } else if ( type == 'scatter' ) {
            opt.series.lines.show  = false;
            opt.series.lines.fill  = false;
            opt.series.bars.show   = false;
            opt.series.points.show = true;
        }
        return chart;
    };

    chart.grid = function(_) {
        if ( !arguments.length ) return options().grid.show;
        options().grid.show = _;
        return chart;
    }

    chart.points = function(_) {
        if ( !arguments.length ) return options().series.points.show;
        options().series.points.show = _;
        return chart;
    }

    chart.stack = function(_) {
        if ( !arguments.length ) return options().series.stack;
        if ( _ == false )
            _ = null;
        options().series.stack = _;
        return chart;
    }

    chart.fill = function(_) {
        if ( !arguments.length ) return options().series.lines.fill;
        options().series.lines.fill = _;
        return chart;
    }

    chart.step = function(_) {
        if ( !arguments.length ) return options().series.lines.steps;
        options().series.lines.steps = _;
        return chart;
    }

    chart.y_label = function(_) {
        if ( !arguments.length ) return options().yaxes[0].axisLabel;
        options().yaxes[0].axisLabel = _;
        return chart;
    }

    chart.colors = function(_) {
        if ( !arguments.length ) return options().colors;
        options().colors = _;
        return chart;
    }

    return chart;
};

opendash.make_chart = function(element, data) {
    var chart = opendash.time_series_chart()
        .data(data)
        // .url(entity.data_uri)
        .container(element)
        .legend(false)
        // .y_label(entity.options.y_label || '')
        // .line_width(entity.options.line_width || 1)
        // .stack(entity.options.stack || false)
        // .type(entity.options.chart_type || 'line');
        .type('line');
    chart.options().grid.borderColor = "#333";
    return chart;
};

opendash.colors = {

    // Some color palettes", handily compiled by the Stanford Vis
    // Group for their Color Palette Analyzer project.
    // http://vis.stanford.edu/color-names/analyzer/
    AppleSpectrum:[ "#2d588a", "#58954c", "#e9a044", "#c12f32", "#723e77", "#7d807f" ],
    AppleBlue:    [ "#4972a8", "#92b9d8", "#002d64", "#599bcf", "#00070f", "#134d8d" ],
    AppleBrown:   [ "#8b6c4f", "#c8b68e", "#3b291d", "#ae8e5d", "#1b0d00", "#713f24" ],
    AppleGrey:    [ "#717372", "#c0c2c1", "#2d2f2e", "#8c8e8d", "#000000", "#484a49" ],
    AppleGreen:   [ "#2d632f", "#90b879", "#0d2d16", "#599a48", "#000b05", "#00431a" ],
    Tableau10:    [ "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b",
                    "#e377c2", "#7f7f7f", "#bcbd22", "#17becf" ],
    Tableau20:    [ "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a",
                    "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94",
                    "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d",
                    "#17becf", "#9edae5" ],
    ManyEyes:     [ "#9c9ede", "#7375b5", "#4a5584", "#cedb9c", "#b5cf6b", "#8ca252",
                    "#637939", "#e7cb94", "#e7ba52", "#bd9e39", "#8c6d31", "#e7969c",
                    "#d6616b", "#ad494a", "#843c39", "#de9ed6", "#ce6dbd", "#a55194",
                    "#7b4173" ],
    Numbers6:     [ "#2d588a", "#58954c", "#e9a044", "#c12f32", "#723e77", "#7d807f" ],
    Excel10:      [ "#365e96", "#983334", "#77973d", "#5d437c", "#36869f", "#d1702f",
                   "#8197c5", "#c47f80", "#acc484", "#9887b0" ],
    Economist:    [ "#621e15", "#e59076", "#128dcd", "#083c52", "#64c5f2", "#61afaf",
                    "#0f7369", "#9c9da1" ],
    BrewerQ9:     [ "#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33",
                    "#a65628", "#f781bf", "#999999" ],
    BrewerQ10:    [ "#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c",
                    "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a" ],
    BrewerQ12:    [ "#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462",
                    "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f" ],
    BrewerDiv1:   [ "#8c510a", "#d8b365", "#f6e8c3", "#f5f5f5", "#c7eae5", "#5ab4ac",
                    "#01665e" ],
    BrewerDiv2:   [ "#b2182b", "#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0", "#67a9cf",
                    "#2166ac" ],
    BrewerDiv3:   [ "#762a83", "#af8dc3", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#7fbf7b",
                    "#1b7837" ],
    BrewerDiv4:   [ "#d73027", "#fc8d59", "#fee090", "#ffffbf", "#e0f3f8", "#91bfdb",
                    "#4575b4" ],
    MarketMap :   [ "#fa0007", "#ac0000", "#4e0300", "#000000", "#005101", "#06a200",
                    "#07ff00" ],


    // Some more color palettes from Rickshaw
    Spectrum14:  ["#ecb796", "#dc8f70", "#b2a470", "#92875a", "#716c49", "#d2ed82",
                  "#bbe468", "#a1d05d", "#e7cbe6", "#d8aad6", "#a888c2", "#9dc2d3",
                  "#649eb9", "#387aa3"].reverse(),
    Spectrum2000:["#57306f", "#514c76", "#646583", "#738394", "#6b9c7d", "#84b665",
                  "#a7ca50", "#bfe746", "#e2f528", "#fff726", "#ecdd00", "#d4b11d",
                  "#de8800", "#de4800", "#c91515", "#9a0000", "#7b0429", "#580839",
                  "#31082b"],
    Spectrum2001:["#2f243f", "#3c2c55", "#4a3768", "#565270", "#6b6b7c", "#72957f",
                  "#86ad6e", "#a1bc5e", "#b8d954", "#d3e04e", "#ccad2a", "#cc8412",
                  "#c1521d", "#ad3821", "#8a1010", "#681717", "#531e1e", "#3d1818",
                  "#320a1b"],
    Classic9:    ["#423d4f", "#4a6860", "#848f39", "#a2b73c", "#ddcb53", "#c5a32f",
                  "#7d5836", "#963b20", "#7c2626", "#491d37", "#2f254a"].reverse(),
    Colorwheel:  ["#b5b6a9", "#858772", "#785f43", "#96557e", "#4682b4", "#65b9ac",
                  "#73c03a", "#cb513a"].reverse(),
    Cool:        ["#5e9d2f", "#73c03a", "#4682b4", "#7bc3b8", "#a9884e", "#c1b266",
                  "#a47493", "#c09fb5"],
    Munin:       ["#00cc00", "#0066b3", "#ff8000", "#ffcc00", "#330099", "#990099",
                  "#ccff00", "#ff0000", "#808080", "#008f00", "#00487d", "#b35a00",
                  "#b38f00", "#6b006b", "#8fb300", "#b30000", "#bebebe", "#80ff80",
                  "#80c9ff", "#ffc080", "#ffe680", "#aa80ff", "#ee00cc", "#ff8080",
                  "#666600", "#ffbfff", "#00ffcc", "#cc6699", "#999900"],

    // Some more color palettes from d3.js
    D3Category10: [ "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b",
                    "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],

    D3Category20: ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a",
                   "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94",
                   "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d",
                   "#17becf", "#9edae5" ],

    D3Category20b: [ "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252",
                     "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94",
                     "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194",
                     "#ce6dbd", "#de9ed6" ],

    D3Category20c: ["#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#e6550d", "#fd8d3c",
                    "#fdae6b", "#fdd0a2", "#31a354", "#74c476", "#a1d99b", "#c7e9c0",
                    "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb", "#636363", "#969696",
                    "#bdbdbd", "#d9d9d9"]

};
