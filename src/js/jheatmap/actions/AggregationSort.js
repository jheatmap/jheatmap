/**
 * Set aggregation sorter as default
 *
 * @example
 * new jheatmap.actions.AggregationSort(heatmap);
 *
 * @param heatmap   The target heatmap
 * @class
 */
jheatmap.actions.AggregationSort = function (heatmap) {
    this.heatmap = heatmap;
    this.shortCut = "A";
    this.keyCodes = [97, 65];
    this.title = "Sort by aggregated values";
};

jheatmap.actions.AggregationSort.prototype.rows = function() {
    var heatmap = this.heatmap;
    heatmap.cols.DefaultAggregationSorter = jheatmap.sorters.AggregationValueSorter;
    heatmap.cols.sorter = new heatmap.cols.DefaultAggregationSorter(heatmap.cells.selectedValue, heatmap.cols.sorter.asc, heatmap.rows.selected.slice(0));
    heatmap.cols.sorter.sort(heatmap, "columns");
    heatmap.drawer.paint();
};

jheatmap.actions.AggregationSort.prototype.columns = function() {
    var heatmap = this.heatmap;
    heatmap.rows.DefaultAggregationSorter = jheatmap.sorters.AggregationValueSorter;
    heatmap.rows.sorter = new heatmap.rows.DefaultAggregationSorter(heatmap.cells.selectedValue, heatmap.rows.sorter.asc, heatmap.cols.selected.slice(0));
    heatmap.rows.sorter.sort(heatmap, "rows");
    heatmap.drawer.paint();
};

