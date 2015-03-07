/**
 * Flot plugin to draw bar chart values on each bar
 *
 * Specifying for all series:
 * 
 * series: {
 *     bars: {
 *         numbers : {
 *             show:       boolean
 *             formatter:  function - formats the value - defaults to just display the value
 *             font:       font - font specification of the number
 *             fontColor:  colorspec - color of the number
 *             xAlign:     function - x-value transform - defaults to horizontal center of bar
 *             yAlign:     function - y-value transform - defaults to vertical center of bar
 *             threshold:  float|false - percentage of maximum chart value with which to display numbers above the bar
 *             xOffset:    integer - number of pixels of additional horizontal offset to apply to each number
 *             yOffset:    integer - number of pixels of additional vertical offset to apply to each number
 *         }
 *     }
 * }
 * 
 * The numbers can also be turned on or off for a specific series:
 * 
 *  $.plot($("#placeholder"), [{
 *      data: [ ... ],
 *      bars: { numbers: { ... } }
 *  }])
 * 
 * (c) Daniel Head <head.daniel47@gmail.com>
 * (c) Jason Roman <j@jayroman.com>
 * 
 * Original by Joe Tsoi, FreeBSD-License
 * @link https://github.com/joetsoi/flot-barnumbers
 */
(function($)
{
    "use strict";

    var options = {
        bars: {
            numbers: {
            }
        }
    };

    function processOptions(plot, options)
    {
        var barnumbers = options.series.bars.numbers;

        barnumbers.show = barnumbers.show || false;
        barnumbers.threshold = barnumbers.threshold || false;
        barnumbers.xOffset = barnumbers.xOffset || 0;
        barnumbers.yOffset = barnumbers.yOffset || 0;
    }

    /**
     * Draw the bar values on the bars
     * 
     * @param {function} plot - the Flot plot function
     * @param {Object} ctx - CanvasRenderingContext2D for the text rendering
     */
    function draw(plot, ctx)
    {
        // loop through each series
        $.each(plot.getData(), function(index, series)
        {
            var xAlign, yAlign, horizontalShift, i;
            var barnumbers = series.bars.numbers;

            // make sure this series should show the bar numbers
            if (!barnumbers.show) {
                return false;
            }

            // if user-specified function for xAlign, set that
            if ($.isFunction(barnumbers.xAlign)) {
                xAlign = barnumbers.xAlign;
            }
            // otherwise horizontally center the text in the bar
            else
            {
                if (series.bars.horizontal) {
                    xAlign = function(x) { return x / 2; };
                }
                else {
                    xAlign = function(x) { return x + (series.bars.barWidth / 2); };
                }
            }

            // if user-specified function for yAlign, set that
            if ($.isFunction(barnumbers.yAlign)) {
                yAlign = barnumbers.yAlign;
            }
            // otherwise vertically center the text in the bar
            else
            {
                if (series.bars.horizontal) {
                    yAlign = function(y) { return y + (series.bars.barWidth / 2); };
                }
                else {
                    yAlign = function(y) { return y / 2; };
                }
            }

            // handles horizontal bar shift for stacked bars using the proper access
            horizontalShift = (series.bars.horizontal) ? 0 : 1;

            // variable shortcuts
            var points      = series.datapoints.points;
            var ctx         = plot.getCanvas().getContext('2d');
            var offset      = plot.getPlotOffset();

            // set the text font and color and center it
            ctx.font            = barnumbers.font;
            ctx.fillStyle       = barnumbers.fontColor;
            ctx.textBaseline    = 'middle';
            ctx.textAlign       = 'center';

            // axes are used for shifting x/y values in case this is a horizontal bar chart
            var axes = {
                0 : 'x',
                1 : 'y'
            };

            // draw each bar value, either above or below the chart
            for (i = 0; i < points.length; i += series.datapoints.pointsize)
            {
                var text;
                var xOffset     = barnumbers.xOffset;
                var yOffset     = barnumbers.yOffset;
                var barNumber   = i + horizontalShift;

                // get the point of where the value will be displayed
                var point = {
                    'x': xAlign(points[i]),
                    'y': yAlign(points[i+1])
                };

                // set the text equal to the bar value
                if (series.stack == null || series.stack === false) {
                    text = points[barNumber];
                }
                // compatible with the plugin to stack bars
                else
                {
                    point[axes[horizontalShift]] = (points[barNumber] - series.data[i/3][horizontalShift] / 2);
                    text = series.data[i/3][horizontalShift];
                }

                // format the number if defined
                if ($.isFunction(barnumbers.formatter)) {
                    text = barnumbers.formatter(text);
                }

                // if threshold and horizontal bars, move numbers inside the bar if greater than/equal to the threshold
                if (barnumbers.threshold && series.bars.horizontal)
                {
                    // compares the value against the threshold (x-axis max * user-defined percentage)
                    if (points[barNumber] >= (plot.getAxes().xaxis.max * barnumbers.threshold))
                    {
                        xOffset *= -1;
                        ctx.textAlign = 'end';
                    }
                    else {
                        ctx.textAlign = 'start';
                    }
                }
                // if threshold and vertical bars, move numbers above the bar if less than the threshold
                else if (barnumbers.threshold && !series.bars.horizontal)
                {
                    // compares the value against the threshold (y-axis max * user-defined percentage)
                    if (points[barNumber] < (plot.getAxes().yaxis.max * barnumbers.threshold))
                    {
                        yOffset *= -1;
                        ctx.textBaseline = 'alphabetic';
                    }
                    else {
                        ctx.textBaseline = 'top';
                    }
                }

                // display the value, and add the bar offset if specified
                var c = plot.p2c(point);

                // write the number on the bar
                ctx.fillText(text.toString(10), c.left + offset.left + xOffset, c.top + offset.top + yOffset);
            }
        });
    }

    /**
     * Initialize the hook on drawing the chart
     * 
     * @param {function} plot - the Flot plot function
     */
    function init(plot)
    {
        plot.hooks.processOptions.push(processOptions);
        plot.hooks.draw.push(draw);
    }

    // push as an available plugin to Flot
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'barnumbers-enhanced',
        version: '1.0'
    });

})(jQuery);