/**
 * Numeric sort comparator
 *
 * @example
 * new jheatmap.sorters.ValueSorter(heatmapDimension);
 * @class
 * @param {HeatmapDimension} heatmapDimension   The heatmap dimension to sort
 */
jheatmap.sorters.ValueSorter = function (heatmap, sortType, field, asc, index) {

    this.cells = heatmap.cells;
    this.rowsSort = (sortType=="rows");
    this.sortDimension = (this.rowsSort ? heatmap.rows : heatmap.cols);
    this.index = index;
    this.field = field;
    this.asc = asc;
    this.getPosition = (this.rowsSort ?
        function(pos) {
            return (pos * heatmap.cols.values.length) + index;
        }
        :
        function(pos) {
            return index * heatmap.cols.values.length + pos;
        });
};

jheatmap.sorters.ValueSorter.prototype.sort = function() {

    var field = this.field;
    var asc = this.asc;
    var values = this.cells.values;
    var getPosition = this.getPosition;

    this.sortDimension.order.stableSort(function (o_a, o_b) {

        var value_a = values[getPosition(o_a)];
        var value_b = values[getPosition(o_b)];

        var v_a = (value_a == null ? null : parseFloat(value_a[field]));
        var v_b = (value_b == null ? null : parseFloat(value_b[field]));


        if (isNaN(v_a) && v_b == null) {
            return -1;
        }

        if (isNaN(v_b) && v_a == null) {
            return 1;
        }

        if (v_a == null || isNaN(v_a)) {
            return 1;
        }

        if (v_b == null || isNaN(v_b)) {
            return -1;
        }

        var val = (asc ? 1 : -1);

        return (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
    });

}
