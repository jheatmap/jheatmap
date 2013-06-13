/**
 * Numeric sorter by value of multiple aggregated rows or columns.
 *
 * @example
 * new jheatmap.sorters.AggregationValueSorter(heatmap, "rows", 3, true, [23, 24, 32, 45, 50] );
 * @class
 * @param {int}     field       Value field to aggregate
 * @param {boolean} asc         True to sort ascending, false to sort descending
 * @param {Array}   indices     Integer positions of the selected rows/columns to aggregate.
 */
jheatmap.sorters.AggregationValueSorter = function (field, asc, indices) {
    this.field = field;
    this.asc = asc;
    this.indices = indices;
};

/**
 * Sort the heatmap
 *
 * @param {jheatmap.Heatmap} heatmap     The heatmap to sort
 * @param {string}  sortType            "rows" or "columns"
 */
jheatmap.sorters.AggregationValueSorter.prototype.sort = function(heatmap, sortType) {

    var cells = heatmap.cells;
    var rowsSort = (sortType=="rows");
    var sortDimension = (rowsSort ? heatmap.rows : heatmap.cols);
    var aggregationDimension = (rowsSort ? heatmap.cols : heatmap.rows);
    this.indices = this.indices || aggregationDimension.order;

    var aggregation = [];

    var cl = heatmap.cols.values.length;
    for (var r = 0; r < sortDimension.order.length; r++) {
        var values = [];
        for (var i = 0; i < this.indices.length; i++) {
            var pos = (rowsSort ? sortDimension.order[r] * cl + this.indices[i] : this.indices[i] * cl + sortDimension.order[r]);
            var value = cells.values[pos];
            if (value != null) {
                values.push(value[this.field]);
            }
        }
        aggregation[sortDimension.order[r]] = sum = cells.aggregators[this.field].accumulate(values);
    }

    var asc = this.asc;
    sortDimension.order.stableSort(function (o_a, o_b) {
        var v_a = aggregation[o_a];
        var v_b = aggregation[o_b];
        var val = (asc ? 1 : -1);
        return (v_a == v_b) ? 0 : (v_a > v_b ? val : -val);
    });

};
