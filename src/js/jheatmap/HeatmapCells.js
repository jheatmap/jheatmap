/**
 *
 * Heatmap cells
 *
 * @class
 */
jheatmap.HeatmapCells = function (heatmap) {

    /**
     * The heatmap
     *
     * @type {jheatmap.Heatmap}
     */
    this.heatmap = heatmap;

    /**
     * Header of the multiple cell values
     * @type {Array}
     */
    this.header = [];

    /**
     * Array of arrays with all the cell values (one array per cell)
     * @type {Array}
     */
    this.values = [];

    /**
     * Index of the current visible cell field (zero it's the first)
     * @type {number}
     */
    this.selectedValue = 0;

    /**
     * Decorators for the cell fields
     * @type {Array}
     */
    this.decorators = [];

    /**
     * Aggregators for the cell fields
     * @type {Array}
     */
    this.aggregators = []

};

jheatmap.HeatmapCells.prototype.init = function () {

    // Initialize decorators & aggregators
    var f;
    var defaultDecorator = new jheatmap.decorators.Constant({});
    var defaultAggregator = new jheatmap.aggregators.Addition();
    for (f = 0; f < this.header.length; f++) {
        this.decorators[f] = defaultDecorator;
        this.aggregators[f] = defaultAggregator;
    }
};

jheatmap.HeatmapCells.prototype.reindex = function () {
    jheatmap.utils.reindexArray(this.decorators, this.header);
    jheatmap.utils.reindexArray(this.aggregators, this.header);
    this.selectedValue = jheatmap.utils.reindexField(this.selectedValue, this.header);
};

/**
 * Get cell value
 *
 * @param row   Row position
 * @param col   Column position
 * @param field Field position
 * @return The cell value
 */
jheatmap.HeatmapCells.prototype.getValue = function (row, col, field) {

    var cl = this.heatmap.cols.values.length;
    var pos = this.heatmap.rows.order[row] * cl + this.heatmap.cols.order[col];

    var value = this.values[pos];

    if (value == null) {
        return null;
    }

    return value[field];
};