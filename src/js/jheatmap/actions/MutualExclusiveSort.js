/**
 *
 * Set mutual exclusive sorter as default
 *
 * @example
 * new jheatmap.actions.MutualExclusiveSort(heatmap);
 *
 * @param heatmap   The target heatmap
 * @class
 */
jheatmap.actions.MutualExclusiveSort = function (heatmap) {
    this.heatmap = heatmap;
    this.shortCut = "M";
    this.keyCodes = [109, 77];
    this.title = "Sort by mutual exclusive";
};

jheatmap.actions.MutualExclusiveSort.prototype.rows = function() {
    var heatmap = this.heatmap;
    heatmap.cols.DefaultAggregationSorter = jheatmap.sorters.MutualExclusiveSorter;
    heatmap.cols.sorter.asc = !heatmap.cols.sorter.asc;
    heatmap.cols.sorter = new heatmap.cols.DefaultAggregationSorter(heatmap.cells.selectedValue, heatmap.cols.sorter.asc, heatmap.rows.selected.slice(0));
    heatmap.cols.sorter.sort(heatmap, "columns");
    heatmap.drawer.paint();
};

jheatmap.actions.MutualExclusiveSort.prototype.columns = function() {
    var heatmap = this.heatmap;
    heatmap.rows.DefaultAggregationSorter = jheatmap.sorters.MutualExclusiveSorter;
    heatmap.rows.sorter.asc = !heatmap.rows.sorter.asc;
    heatmap.rows.sorter = new heatmap.rows.DefaultAggregationSorter(heatmap.cells.selectedValue, heatmap.rows.sorter.asc, heatmap.cols.selected.slice(0));
    heatmap.rows.sorter.sort(heatmap, "rows");
    heatmap.drawer.paint();
};

