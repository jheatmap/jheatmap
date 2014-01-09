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
    this.title = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;by mutual exclusive";
};

jheatmap.actions.MutualExclusiveSort.prototype.rows = function() {
    var heatmap = this.heatmap;

    heatmap.cols.sorter.asc = !heatmap.cols.sorter.asc;

    if (heatmap.rows.selected.length == 0) {
        indices = heatmap.rows.order.slice(0);
    } else {
        indices = heatmap.rows.selected.slice(0);
    }

    heatmap.cols.sorter = new jheatmap.sorters.MutualExclusiveSorter(heatmap.cells.selectedValue, heatmap.cols.sorter.asc, indices);
    heatmap.cols.sorter.sort(heatmap, "columns");
    heatmap.drawer.paint();
};

jheatmap.actions.MutualExclusiveSort.prototype.columns = function() {
    var heatmap = this.heatmap;
    heatmap.rows.sorter.asc = !heatmap.rows.sorter.asc;

    if (heatmap.cols.selected.length == 0) {
        indices = heatmap.cols.order.slice(0);
    } else {
        indices = heatmap.cols.selected.slice(0);
    }

    heatmap.rows.sorter = new jheatmap.sorters.MutualExclusiveSorter(heatmap.cells.selectedValue, heatmap.rows.sorter.asc, indices);
    heatmap.rows.sorter.sort(heatmap, "rows");
    heatmap.drawer.paint();
};

