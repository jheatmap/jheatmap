/**
 * Numeric sort comparator
 *
 * @example
 * new jheatmap.sorters.AnnotationSorter(heatmapDimension);
 * @class
 * @param {HeatmapDimension} heatmapDimension   The heatmap dimension to sort
 */
jheatmap.sorters.AnnotationSorter = function (heatmapDimension, field, asc) {
    this.heatmapDimension = heatmapDimension || [];
    this.field = field;
    this.asc = asc;
};

jheatmap.sorters.AnnotationSorter.prototype.sort = function() {

    var values = this.heatmapDimension.values;
    var field = this.field;
    var asc = this.asc;

    this.heatmapDimension.order.stableSort(function (a, b) {

        var v_a = values[a][field].toLowerCase();
        var v_b = values[b][field].toLowerCase();

        if (!isNaN(v_a)) {
            v_a = parseFloat(v_a);
            v_b = parseFloat(v_b);
        }
        var val = (asc ? 1 : -1);
        return (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
    });
}
