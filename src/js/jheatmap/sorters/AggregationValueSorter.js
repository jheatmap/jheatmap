/**
 * Numeric sorter by value of multiple aggregated rows or columns.
 *
 * @example
 * new jheatmap.sorters.AggregationValueSorter(heatmap, "rows", 3, true, [23, 24, 32, 45, 50] );
 * @class
 * @param {int}     field       Value field to aggregate
 * @param {boolean} asc         True to sort ascending, false to sort descending
 * @param {boolean} nullsLast   True to sort null values always to the end. False to treat as zero.
 * @param {Array}   indices     Integer positions of the selected rows/columns to aggregate.
 */
jheatmap.sorters.AggregationValueSorter = function (field, asc, nullsLast, indices) {
    this.field = field;
    this.asc = asc;
    this.indices = indices;
    this.nullsLast = nullsLast;
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
                  v1 = value[this.field];
                  if (v1 != null && v1 != '-') {
                    values.push(v1);
                  }
            }
        }
        if (values.length == 0) {
            aggregation[sortDimension.order[r]] = undefined;
        } else {
            aggregation[sortDimension.order[r]] = cells.aggregators[this.field].accumulate(values);
        }
    }

    var asc = this.asc;
    var nullsLast = this.nullsLast;

    var compareFunction = function (o_a, o_b) {
        var v_a = aggregation[o_a];
        var v_b = aggregation[o_b];
        var val = (asc ? 1 : -1);

        if (v_a == undefined) {
           if (nullsLast) {
               return 1;
           } else {
               v_a = 0;
           }
        }

        if (v_b == undefined) {
            if (nullsLast) {
                return -1;
            } else {
                v_b = 0;
            }
        }

        return (v_a == v_b) ? 0 : (v_a > v_b ? val : -val);
    };


    if (sortDimension.selected.length == 0) {
        sortDimension.order.stableSort(compareFunction);
    } else {

        // Un select all elements that are not visible
        var isVisible = function(x) {return sortDimension.order.indexOf(x)!=-1};
        sortDimension.selected = sortDimension.selected.filter(isVisible);

        // Sort the selected and visible items
        sortDimension.selected.stableSort(compareFunction);

        // Map selected order to all visible items.
        var isNotSelected = function(x) {return sortDimension.selected.indexOf(x)==-1};
        var c=0;
        sortDimension.order = sortDimension.order.map(function(x){
            return isNotSelected(x) ? x : sortDimension.selected[c++];
        });
    }



};
