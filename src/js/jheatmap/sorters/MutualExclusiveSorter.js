/**
 * This is a mutual exclusive sorter.
 *
 * @example
 * new jheatmap.sorters.MutualExclusiveSorter();
 *
 * @class
 */
jheatmap.sorters.MutualExclusiveSorter = function (field, asc, indices) {
    this.field = field;
    this.asc = asc;
    this.indices = indices;
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

    var sorter = new jheatmap.sorters.AggregationValueSorter(this.field, false, false, this.indices);
    sorter.sort(heatmap, sortType);

    sorter.asc = this.asc;

    sorter.indices = [ 0 ];

    var selection;
    if (sortDimension.selected.length == 0) {
        selection = sortDimension.order;
    } else {
        var isSelected = function(x) {return sortDimension.selected.indexOf(x)>-1};
        selection = sortDimension.order.filter(isSelected);
    }

    for (var i = selection.length - 1; i >= 0; i--) {
        sorter.indices[0] = selection[i];
        sorter.sort(heatmap, otherType);
    }

};
