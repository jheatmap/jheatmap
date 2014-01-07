/**
 *
 * Heatmap dimension
 *
 * @class
 */
jheatmap.HeatmapDimension = function (heatmap) {

    /**
     * Height in pixels of one cell (default 12)
     * @type {number}
     */
    this.zoom = 12;

    /**
     * Height or width in pixels of the label canvas.
     *
     * @type {number}
     */
    this.labelSize = 230;

    /**
     * Header of the items values
     * @type {Array}
     */
    this.header = [];

    /**
     * Array with all the items values and annotations (one array per line)
     * @type {Array}
     */
    this.values = [];

    /**
     * Array of index of the visible values sorted as current order
     * @type {Array}
     */
    this.order = [];

    /**
     * Index of the current visible row label (zero it's the first)
     * @type {number}
     */
    this.selectedValue = 0;

    /**
     * type: Type of sort ('none', 'label', 'single' or 'value')
     * field: Index of the field that we are sorting
     * asc: true if ascending order, false if descending
     *
     * @type {jheatmap.sorters.DefaultSorter}
     */
    this.sorter = new jheatmap.sorters.DefaultSorter();

    /**
     * This is the default sorter to be used when sorting multiple selected items.
     */
    this.DefaultAggregationSorter = jheatmap.sorters.AggregationValueSorter;

    /**
     * Active user filters on items
     * @type {jheatmap.HeatmapFilters}
     */
    this.filters = new jheatmap.HeatmapFilters(heatmap);

    /**
     * Decorators for the items fields
     * @type {Array}
     */
    this.decorators = [];

    /**
     * Array with the index of the items fields to show as annotations
     * @type {Array}
     */
    this.annotations = [];

    /**
     * Height or width in pixels of each annotation cell.
     * @type {number}
     */
    this.annotationSize = 10;

    /**
     *
     * Index of the selected items
     *
     * @type {Array}
     */
    this.selected = [];

};

jheatmap.HeatmapDimension.prototype.init = function () {

    // Initialize order array
    this.order = [];
    var i;
    for (i = 0; i < this.values.length; i++) {
        this.order[this.order.length] = i;
    }

    // Initialize default decorator
    var defaultDecorator = new jheatmap.decorators.Constant({});
    for (c = 0; c < this.header.length; c++) {
        this.decorators[c] = defaultDecorator;
    }

};

jheatmap.HeatmapDimension.prototype.reindex = function (heatmap) {

    jheatmap.utils.reindexArray(this.decorators, this.header);
    jheatmap.utils.reindexArray(this.aggregators, this.header);
    jheatmap.utils.convertToIndexArray(this.annotations, this.header);

    var key;
    for(key in this.filters) {
        jheatmap.utils.convertToIndexArray(this.filters[key].fields, heatmap.cells.header);
    }

    this.sorter.field = jheatmap.utils.reindexField(this.sorter.field, heatmap.cells.header);
    this.selectedValue = jheatmap.utils.reindexField(this.selectedValue, this.header);

};

jheatmap.HeatmapDimension.prototype.getValue = function (col, field) {
    return this.values[this.order[col]][field];
};

