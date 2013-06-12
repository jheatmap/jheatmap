/**
 * Numeric aggregation sorter
 *
 * @example
 * new jheatmap.sorters.AggregationValueSorter(heatmapDimension);
 * @class
 * @param {HeatmapDimension} heatmapDimension   The heatmap dimension to sort
 */
jheatmap.sorters.AggregationValueSorter = function (heatmap, sortType, field, asc, item) {

    this.field = field;
    this.asc = asc;
    this.cells = heatmap.cells;
    this.rowsSort = (sortType=="rows");
    this.sortDimension = (this.rowsSort ? heatmap.rows : heatmap.cols);
    this.aggregationDimension = (this.rowsSort ? heatmap.cols : heatmap.rows);
    this.item = item || this.aggregationDimension.order;

};

jheatmap.sorters.AggregationValueSorter.prototype.sort = function() {

    var aggregation = [];

    var cl = (this.rowsSort ? this.aggregationDimension.values.length : this.sortDimension.values.length);
    for (var r = 0; r < this.sortDimension.order.length; r++) {
        var values = [];
        for (var i = 0; i < this.item.length; i++) {
            var pos = (this.rowsSort ? this.sortDimension.order[r] * cl + this.item[i] : this.item[i] * cl + this.sortDimension.order[r]);
            var value = this.cells.values[pos];
            if (value != null) {
                values.push(value[this.field]);
            }
        }
        aggregation[this.sortDimension.order[r]] = sum = this.cells.aggregators[this.field].accumulate(values);
    }

    var asc = this.asc;
    this.sortDimension.order.stableSort(function (o_a, o_b) {
        var v_a = aggregation[o_a];
        var v_b = aggregation[o_b];
        var val = (asc ? 1 : -1);
        return (v_a == v_b) ? 0 : (v_a > v_b ? val : -val);
    });

}
