/**
 * Numeric sorter by row or column annotation
 *
 * @example
 * new jheatmap.sorters.AnnotationSorter(heatmapDimension, 2, true);
 *
 * @class
 * @param {int}                 field               Value field to aggregate
 * @param {boolean}             asc                 True to sort ascending, false to sort descending
 */
jheatmap.sorters.AnnotationSorter = function (field, asc) {
    this.field = field;
    this.asc = asc;
    this.indices = [];
};

/**
 * Sort the heatmap
 *
 * @param {jheatmap.Heatmap} heatmap     The heatmap to sort
 * @param {string}  sortType            "rows" or "columns"
 */
jheatmap.sorters.AnnotationSorter.prototype.sort = function(heatmap, sortType) {

    var heatmapDimension = (sortType == "rows" ? heatmap.rows : heatmap.cols);
    var values = heatmapDimension.values;
    var field = this.field;
    var asc = this.asc;

    heatmapDimension.order.stableSort(function (a, b) {

        var v_a = values[a][field];
        var v_b = values[b][field];

        if (!isNaN(v_a)) {
            v_a = parseFloat(v_a);
            v_b = parseFloat(v_b);
        }
        var val = (asc ? 1 : -1);
        return (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
    });
}
