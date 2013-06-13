/**
 *
 * Heatmap interactive viewer
 *
 * @author Jordi Deu-Pons
 * @class
 */
jheatmap.Heatmap = function (options) {

    /**
     * User configuration
     *
     * @type {*|{}}
     */
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
     * Current search string to highlight matching rows and columns.
     * Default 'null' means no search.
     */
    this.search = null;

    /**
     * Heatmap rows
     *
     * @type {jheatmap.HeatmapDimension}
     */
    this.rows = new jheatmap.HeatmapDimension(this);

    /**
     * Heatmap columns
     *
     * @type {jheatmap.HeatmapDimension}
     */
    this.cols = new jheatmap.HeatmapDimension(this);

    /**
     * Heatmap cells
     *
     * @type {jheatmap.HeatmapCells}
     */
    this.cells = new jheatmap.HeatmapCells(this);

    /**
     * Initialize the Heatmap
     */
    this.init = function () {

        this.rows.init();
        this.cols.init();
        this.cells.init();

        // Call user init function
        this.options.init(this);

        // Reindex configuration. Needed to let the user use position or header id interchangeably
        this.rows.reindex(this);
        this.cols.reindex(this);
        this.cells.reindex(this);

        // Filter
        this.rows.filters.filter(this, "rows");
        this.cols.filters.filter(this, "columns");

        // Sort
        this.rows.sorter.sort(this, "rows");
        this.cols.sorter.sort(this, "columns");

        // Build & paint
        var drawer = new jheatmap.HeatmapDrawer(this);
        drawer.build();
        drawer.paint();

    };

};
