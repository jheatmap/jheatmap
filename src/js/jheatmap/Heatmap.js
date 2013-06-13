/**
 *
 * Heatmap interactive viewer
 *
 * @author Jordi Deu-Pons
 * @class
 */
jheatmap.Heatmap = function (options) {

    this.options = options || {};

    /**
     * Size of the cells panel
     *
     * @property {number}   width   - Cells panel width
     * @property {number}   height  - Cells panel heigth
     */
    this.size = {
        width:800,
        height:800
    };

    /**
     * Position of the first cell on the top left corner
     *
     * @property {number}   top     - Position of the first row to show on the top of the heatmap
     * @property {number}   left    - Position of the first column to show on the left of the heatmap
     */
    this.offset = {
        top:0,
        left:0
    };

    /**
     * User defined filters
     */
    this.filters = {};

    /**
     * Current search string to highlight matching rows and columns.
     * Default 'null' means no search.
     */
    this.search = null;

    this.rows = new jheatmap.HeatmapDimension();
    this.cols = new jheatmap.HeatmapDimension();
    this.cells = new jheatmap.HeatmapCells(this);

    /**
     * Activate one filter for the rows
     *
     * @param filterId
     */
    this.addRowsFilter = function (filterId) {

        var currentField = this.cells.selectedValue;
        if (!this.rows.filters[currentField]) {
            this.rows.filters[currentField] = {};
        }

        this.rows.filters[currentField][filterId] = this.filters[filterId];
    };

    /**
     *
     * @param filterId
     */
    this.getRowsFilter = function (filterId) {
        var filter = this.rows.filters[this.cells.selectedValue];

        if (filter) {
            return filter[filterId];
        }

        return filter;
    };

    /**
     *
     * @param filterId
     */
    this.removeRowsFilter = function (filterId) {
        delete this.rows.filters[this.cells.selectedValue][filterId];
    };

    /**
     * Apply all the active filters on the rows.
     */
    this.applyRowsFilters = function () {

        // Initialize rows order
        this.rows.order = [];

        if (this.rows.filters.length == 0) {

            this.rows.order = [];
            for (var r = 0; r < this.rows.values.length; r++) {
                this.rows.order[this.rows.order.length] = r;
            }
            return;
        }

        var cl = this.cols.values.length;

        nextRow: for (r = 0; r < this.rows.values.length; r++) {

            for (var field = 0; field < this.cells.header.length; field++) {

                // Get all column values
                var values = [];
                for (var c = 0; c < this.cols.values.length; c++) {
                    var pos = r * cl + c;
                    values[values.length] = this.cells.values[pos][field];
                }

                // Filters
                var filters = this.rows.filters[field];
                var filterId;
                for (filterId in filters) {
                    if (filters[filterId].filter.filter(values)) {
                        // This filter is filtering this row, so skip it.
                        continue nextRow;
                    }
                }

            }

            this.rows.order[this.rows.order.length] = r;
        }

        this.applyRowsSort();
    };

    /**
     * Initialize the Heatmap
     */
    this.init = function () {

        this.rows.init();
        this.cols.init();
        this.cells.init();

        // Call init function
        this.options.init(this);

        // Reindex configuration. Needed to let the user use position or header id interchangeably
        this.rows.reindex(this);
        this.cols.reindex(this);
        this.cells.reindex(this);
        var key;
        for(key in this.filters) {
            jheatmap.utils.convertToIndexArray(this.filters[key].fields, this.cells.header);
        }

        // Filter
        this.applyRowsFilters();

        // Sort
        this.rows.sorter.sort(this, "rows");
        this.cols.sorter.sort(this, "columns");

        // Build & paint
        var drawer = new jheatmap.HeatmapDrawer(this);
        drawer.build();
        drawer.paint();

    };

};
