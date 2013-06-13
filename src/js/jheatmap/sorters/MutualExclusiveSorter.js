/**
 * This is the default sorter. In fact it's a NO sorter, because it don't do anything.
 * It's also the signature that all the sorters must implement.
 *
 * @example
 * new jheatmap.sorters.DefaultSorter();
 *
 * @class
 */
jheatmap.sorters.MutualExclusiveSorter = function (field, asc) {
    this.field = field;
    this.asc = asc;
    this.indices = [];
};

/**
 * Sort the heatmap
 *
 * @param {jheatmap.Heatmap} heatmap     The heatmap to sort
 * @param {string}  sortType    "rows" or "columns"
 */
jheatmap.sorters.MutualExclusiveSorter.prototype.sort = function(heatmap, sortType) {

    var otherType = (sortType == "rows" ? "columns" : "rows");
    var sortDimension = (sortType == "rows" ? heatmap.rows : heatmap.cols);

    var sorter = new jheatmap.sorters.AggregationValueSorter(this.field, this.asc);
    sorter.sort(heatmap, sortType);

    sorter.indices = [ 0 ];
    for (var i = sortDimension.order.length - 1; i >= 0; i--) {
        sorter.indices[0] = sortDimension.order[i];
        sorter.sort(heatmap, otherType);
    }

};
