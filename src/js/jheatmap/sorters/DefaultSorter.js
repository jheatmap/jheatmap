/**
 * This is the default sorter. In fact it's a NO sorter, because it don't do anything.
 * It's also the signature that all the sorters must implement.
 *
 * @example
 * new jheatmap.sorters.DefaultSorter();
 *
 * @class
 */
jheatmap.sorters.DefaultSorter = function () {
    this.field = 0;
    this.asc = true;
    this.indices = [];
};

/**
 * Sort the heatmap
 *
 * @param {jheatmap.Heatmap} heatmap     The heatmap to sort
 * @param {string}  sortType    "rows" or "columns"
 */
jheatmap.sorters.DefaultSorter.prototype.sort = function(heatmap, sortType) {
};
