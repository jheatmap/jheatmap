/**
 *
 * Heatmap cells
 *
 * @class
 */
jheatmap.HeatmapCells = function () {

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

jheatmap.HeatmapCells.prototype.reindex = function (heatmap) {
    jheatmap.utils.reindexArray(this.decorators, this.header);
    jheatmap.utils.reindexArray(this.aggregators, this.header);
    this.selectedValue = jheatmap.utils.reindexField(this.selectedValue, this.header);
};