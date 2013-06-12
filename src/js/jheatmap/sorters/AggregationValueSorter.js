/**
 * Numeric sorter by value of multiple aggregated rows or columns.
 *
 * @example
 * new jheatmap.sorters.AggregationValueSorter(heatmap, "rows", 3, true, [23, 24, 32, 45, 50] );
 * @class
 * @param {Heatmap} heatmap     The heatmap to sort
 * @param {string}  sortType    "rows" or "columns"
 * @param {int}     field       Value field to aggregate
 * @param {boolean} asc         True to sort ascending, false to sort descending
 * @param {Array}   indices     Integer positions of the selected rows/columns to aggregate.
 */
jheatmap.sorters.AggregationValueSorter = function (heatmap, sortType, field, asc, indices) {

    this.field = field;
    this.asc = asc;
    this.cells = heatmap.cells;
    this.rowsSort = (sortType=="rows");
    this.sortDimension = (this.rowsSort ? heatmap.rows : heatmap.cols);
    this.aggregationDimension = (this.rowsSort ? heatmap.cols : heatmap.rows);
    this.indices = indices || this.aggregationDimension.order;

};

/**
 * Sort the heatmap
 */
jheatmap.sorters.AggregationValueSorter.prototype.sort = function() {

    var aggregation = [];

    var cl = (this.rowsSort ? this.aggregationDimension.values.length : this.sortDimension.values.length);
    for (var r = 0; r < this.sortDimension.order.length; r++) {
        var values = [];
        for (var i = 0; i < this.indices.length; i++) {
            var pos = (this.rowsSort ? this.sortDimension.order[r] * cl + this.indices[i] : this.indices[i] * cl + this.sortDimension.order[r]);
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

};
