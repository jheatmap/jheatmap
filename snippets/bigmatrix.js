var jheatmap = require("jheatmap");
$('#heatmap').heatmap(
  { 
  data : {
    values : new jheatmap.readers.MatrixHeatmapReader({ url: "./bigmatrix/analysis-results.cdm" })
  },

  init : function(heatmap) {

    // Default zoom
    heatmap.cols.zoom = 1;
    heatmap.cols.labelSize = 100;
    heatmap.rows.zoom = 1;

    // Hide controls
    heatmap.controls.shortcuts = false;
    heatmap.controls.filters = true;
    heatmap.controls.columnSelector = false;
    heatmap.controls.rowSelector = false;
    heatmap.controls.cellSelector = false;
    heatmap.controls.poweredByJHeatmap = false;

    // Default cell value
    heatmap.cells.selectedValue = 0;

    // Configure decorators and aggregators
    heatmap.cells.decorators[0] = new jheatmap.decorators.Median( { maxValue: 2 });
    heatmap.cells.aggregators[0] = new jheatmap.aggregators.Median( { maxValue: 2 });

    // Add filters
    heatmap.rows.filters.add(
      "Show only rows with outlier values",
      new jheatmap.filters.NonExpressed({ maxValue: 3, hide: false }),[ 0 ],[ 0 ]);

  }
}
);
