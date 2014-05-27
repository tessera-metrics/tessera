$(function() {
	
	var options = {
		multihighlight: {
			mode: null,	// null, x or y.
			linkedPlots: null,	// null or array of plots.
		}
	};
	
	function init(plot) {
		
		// Builds an array of plots to highlight - the current plot and all the linked plots if any.
		function getPlotsToHighlight() {
			var plotsToHighlight = [ plot ];
			if (plot.getOptions().multihighlight.linkedPlots != null) {
				$.each(plot.getOptions().multihighlight.linkedPlots, function(index, linkedPlot){
					plotsToHighlight.push(linkedPlot);	
				});
			}
			return plotsToHighlight;
		}
		
		function onPlotHover(event, position, item) {
			$.each(getPlotsToHighlight(), function(index, plotToHighlight) {
				if (!plotToHighlight.getOptions().multihighlight.mode != null) {
					plotToHighlight.unhighlight();

					var axisPosition = plotToHighlight.getOptions().multihighlight.mode == 'x' ? position.x : position.y;
					var dataIndex = plotToHighlight.getOptions().multihighlight.mode == 'x' ? 0 : 1;

					var highlightedItems = new Array();
					$.each(plotToHighlight.getData(), function(i, serie) {
						var j;
						for (j = 0; j < serie.data.length; j++) {
							if (serie.data[j] == null || serie.data[j][dataIndex] > axisPosition) {
								break;
							}
						}

						if (j != 0 && serie.data[j] !=null) {
							var highlighted = j-1;
							// Checking which one is closer.
							if (axisPosition-serie.data[j-1][dataIndex] > Math.abs(axisPosition-serie.data[j][dataIndex])) {
								highlighted = j;
							}

							plotToHighlight.highlight(i, highlighted);
							highlightedItems.push({ serieIndex: i, dataIndex: highlighted });
						}
					});
					
					if (highlightedItems.length > 0) {
						plotToHighlight.getPlaceholder().trigger("multihighlighted", [ position, highlightedItems ]);		
					}
					else {
						plotToHighlight.getPlaceholder().trigger("unmultihighlighted");
					}
				}
			});
		}
		
		function onMouseOut(event) {
			$.each(getPlotsToHighlight(), function(index, plotToHighlight) {
				if (!plotToHighlight.getOptions().multihighlight.mode != null) {
					plotToHighlight.unhighlight();
					plotToHighlight.getPlaceholder().trigger("unmultihighlighted");
				}
			});
		}
		
		// Hook up the events.
		plot.hooks.bindEvents.push(function(plot, eventHolder) {
			if (!plot.getOptions().multihighlight.mode)
				return;
			
			plot.getPlaceholder().bind('plothover', onPlotHover);
			plot.getPlaceholder().bind('mouseout', onMouseOut);
		});
		plot.hooks.shutdown.push(function(plot, eventHolder) {
			plot.getPlaceholder().unbind('plothover', onPlotHover);
			plot.getPlaceholder().unbind('mouseout', onMouseOut);
		});
	}
	
	$.plot.plugins.push({
		init: init,
		options: options,
		name: 'multihighlight',
		version: '1.0'
	});
});