/**
 *
 * Heatmap interactive viewer
 *
 * @author Jordi Deu-Pons
 * @class
 */
jheatmap.Heatmap = function (options) {

    this.options = options || {};

    this.divHeatmap = options.container;

    this.textSpacing = 5;
    this.startRow = null;
    this.endRow = null;

    this.startCol = null;
    this.endCol = null;

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

    /**
     * Rows configuration
     *
     * @property {number}           zoom            - Height in pixels of one cell (default 20)
     * @property {Array}            header          - Header of the rows values
     * @property {Array}            values          - Array with all the rows values and annotations (one array per line)
     * @property {Array}            order           - Array of index of the visible values sorted as current order
     * @property {number}           selectedValue   - Index of the current visible row label (zero it's the first)
     * @property {string}           sort.type       - Type of sort ('none', 'label', 'single' or 'value')
     * @property {number}           sort.field      - Index of the field that we are sorting
     * @property {boolean}          sort.asc        - true if ascending order, false if descending
     * @property {Array}            filters         - Active user filters on rows
     * @property {Array}            decorators      - Decorators for the rows fields
     * @property {Array}            annotations     - Array with the index of the rows fields to show
     * @property {Array}            selected        - Index of the selected rows
     */
    this.rows = {
        zoom:20,
        header:[],
        values:[],
        order:[],
        selectedValue:0,
        sort:{
            type:"none",
            field:0,
            asc:false
        },
        filters:[],
        decorators:[],
        annotations:[],
        selected:[]
    };

    /**
     * Columns configuration
     *
     * @property {number}           zoom            - Width in pixels of one cell (default 20)
     * @property {Array}            header          - Header of the columns values
     * @property {Array}            values          - Array of arrays with all the columns values and annotations (one array per line)
     * @property {Array}            order           - Array of index of the visible values sorted as current order
     * @property {number}           selectedValue   - Index of the current visible column label (zero it's the first)
     * @property {string}           sort.type       - Type of sort ('none', 'label', 'single' or 'value')
     * @property {number}           sort.field      - Index of the field that we are sorting
     * @property {boolean}          sort.asc        - true if ascending order, false if descending
     * @property {Array}            filters         - Active user filters on columns
     * @property {Array}            decorators      - Decorators for the columns fields
     * @property {Array}            annotations     - Array with the index of the columns fields to show
     * @property {Array}            selected        - Index of the selected columns
     */
    this.cols = {
        zoom:20,
        header:[],
        values:[],
        order:[],
        selectedValue:0,
        sort:{
            type:"none",
            field:0,
            asc:false
        },
        decorators:[],
        annotations:[],
        selected:[]
    };

    /**
     * Cells configuration
     *
     * @property {Array}    header          - Header of the multiple cell values
     * @property {Array}    values          - Array of arrays with all the cell values (one array per cell)
     * @property {number}   selectedValue   - Index of the current visible cell field (zero it's the first)
     * @property {Array}    decorators      - Decorators for the cell fields
     * @property {Array}    aggregators     - Aggregators for the cell fields
     */
    this.cells = {
        header:[],
        values:[],
        selectedValue:0,
        decorators:[],
        aggregators:[]
    };

    var drawer = new jheatmap.HeatmapDrawer(this);

    this.build = function() {
        drawer.build();
    }

    this.paint = function() {
        drawer.paint();
    }

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
                for (var filterId in filters) {
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
     *  Apply all the filters
     */
    this.applyFilters = function () {
        this.applyRowsFilters();
    };

    /**
     *
     * @param row
     * @param col
     * @param field
     */
    this.getCellValue = function (row, col, field) {
        var cl = this.cols.values.length;
        var pos = this.rows.order[row] * cl + this.cols.order[col];

        var value = this.cells.values[pos];

        if (value == null) {
            return null;
        }

        return value[field];
    };

    /**
     *
     * @param row
     * @param col
     */
    this.getCellValueSelected = function (row, col) {
        return this.getCellValue(row, col, this.cells.selectedValue);
    };

    /**
     *
     * @param row
     * @param field
     */
    this.getRowValue = function (row, field) {
        return this.rows.values[this.rows.order[row]][field];
    };

    /**
     *
     * @param row
     */
    this.getRowValueSelected = function (row) {
        return this.getRowValue(row, this.rows.selectedValue);
    };

    /**
     *
     * @param col
     * @param field
     */
    this.getColValue = function (col, field) {
        return this.cols.values[this.cols.order[col]][field];
    };

    /**
     *
     * @param col
     */
    this.getColValueSelected = function (col) {
        return this.getColValue(col, this.cols.selectedValue);
    };

    /**
     * Initialize the Heatmap
     */
    this.init = function () {

        // Loop iterators
        var r, c, f;

        // Initialize rows order
        this.rows.order = [];
        for (r = 0; r < this.rows.values.length; r++) {
            this.rows.order[this.rows.order.length] = r;
        }

        // Initialize cols order
        this.cols.order = [];
        for (c = 0; c < this.cols.values.length; c++) {
            this.cols.order[this.cols.order.length] = c;
        }

        // Initialize sort columns
        this.cols.sort.type = "none";
        this.cols.sort.field = 0;
        this.cols.sort.asc = false;

        // Initialize sort rows
        this.rows.sort.type = "none";
        this.rows.sort.field = 0;
        this.rows.sort.asc = false;

        // Initialize decorators & aggregators
        var defaultDecorator = new jheatmap.decorators.Constant({});
        var defaultAggregator = new jheatmap.aggregators.Addition();
        for (f = 0; f < this.cells.header.length; f++) {
            this.cells.decorators[f] = defaultDecorator;
            this.cells.aggregators[f] = defaultAggregator;

        }

        for (c = 0; c < this.cols.header.length; c++) {
            this.cols.decorators[c] = defaultDecorator;
        }

        for (r = 0; r < this.rows.header.length; r++) {
            this.rows.decorators[r] = defaultDecorator;
        }

    };

    /**
     *
     * @param f
     * @param asc
     */
    this.sortColsByLabel = function (f, asc) {
        this.cols.sort.type = "label";
        this.cols.sort.field = f;
        this.cols.sort.asc = asc;
        this.applyColsSort();
    };

    /**
     *
     * @param asc
     */
    this.sortColsByValue = function (asc) {
        this.cols.sort.type = "value";
        this.cols.sort.field = this.cells.selectedValue;
        this.cols.sort.asc = asc;
        this.applyColsSort();
    };

    /**
     *
     * @param f
     * @param asc
     */
    this.sortRowsByLabel = function (f, asc) {
        this.rows.sort.type = "label";
        this.rows.sort.field = f;
        this.rows.sort.asc = asc;
        this.applyRowsSort();
    };

    /**
     *
     * @param asc
     */
    this.sortRowsByValue = function (asc) {
        this.rows.sort.type = "value";
        this.rows.sort.field = this.cells.selectedValue;
        this.rows.sort.asc = asc;
        this.applyRowsSort();
    };

    /**
     * Sort all the rows
     */
    this.applyRowsSort = function () {
        var heatmap = this;
        if (this.rows.sort.type == "label") {
            var sorter = new jheatmap.sorters.AnnotationSorter(heatmap.rows, heatmap.rows.sort.field, heatmap.rows.sort.asc);
            sorter.sort();
        } else if (this.rows.sort.type == "value") {
            var sorter = new jheatmap.sorters.AggregationValueSorter(heatmap, "rows", heatmap.rows.sort.field, heatmap.rows.sort.asc, heatmap.rows.sort.item );
            sorter.sort();
        } else if (this.rows.sort.type == "single") {
            var sorter = new jheatmap.sorters.ValueSorter(heatmap, "rows", heatmap.rows.sort.field, heatmap.rows.sort.asc, heatmap.rows.sort.item );
            sorter.sort();
        }
    };

    /**
     * Sort all the columns
     */
    this.applyColsSort = function () {
        var heatmap = this;

        if (this.cols.sort.type == "label") {
            var sorter = new jheatmap.sorters.AnnotationSorter(heatmap.cols, heatmap.cols.sort.field, heatmap.cols.sort.asc);
            sorter.sort();
        } else if (this.cols.sort.type == "value") {
            var sorter = new jheatmap.sorters.AggregationValueSorter(heatmap, "cols", heatmap.cols.sort.field, heatmap.cols.sort.asc, heatmap.cols.sort.item );
            sorter.sort();
        } else if (this.cols.sort.type == "single") {
            var sorter = new jheatmap.sorters.ValueSorter(heatmap, "cols", heatmap.cols.sort.field, heatmap.cols.sort.asc, heatmap.cols.sort.item );
            sorter.sort();
        }
    };

    /**
     * Sort rows and columns
     */
    this.applySort = function () {
        this.applyRowsSort();
        this.applyColsSort();
    };

    /**
     * Show loading image while running 'runme'
     *
     * @param runme Function to execute
     */
    this.loading = function (runme) {
        $('#heatmap-loader').show();
        var interval = window.setInterval(function () {
            runme.call(this);
            $('#heatmap-loader').hide();
            window.clearInterval(interval);
        }, 1);
    };

    this.onHScrollClick = function (e) {
        var maxWidth = (this.endCol - this.startCol) * this.cols.zoom;
        var iniX = Math.round(maxWidth * (this.startCol / this.cols.order.length));
        var endX = Math.round(maxWidth * (this.endCol / this.cols.order.length));
        var pX = e.pageX - $(e.target).offset().left - ((endX - iniX) / 2);
        pX = (pX < 0 ? 0 : pX);
        this.offset.left = Math.round((pX / maxWidth) * this.cols.order.length);
        this.paint();
    };

    var hScrollMouseDown = false;

    this.onHScrollMouseDown = function(e) {
        e.preventDefault();

        hScrollMouseDown = true;
    }

    this.onHScrollMouseUp = function(e) {
        e.preventDefault();

        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
            return;
        }

        hScrollMouseDown = false;
        this.paint();
    }

    this.onHScrollMouseMove = function(e) {

        if (hScrollMouseDown) {
            var maxWidth = (this.endCol - this.startCol) * this.cols.zoom;
            var iniX = Math.round(maxWidth * (this.startCol / this.cols.order.length));
            var endX = Math.round(maxWidth * (this.endCol / this.cols.order.length));
            var pX = e.pageX - $(e.target).offset().left - ((endX - iniX) / 2);
            pX = (pX < 0 ? 0 : pX);
            this.offset.left = Math.round((pX / maxWidth) * this.cols.order.length);
            this.paint();
        }
    }

    this.onVScrollClick = function (e) {
        var maxHeight = (this.endRow - this.startRow) * this.rows.zoom;
        var iniY = Math.round(maxHeight * (this.startRow / this.rows.order.length));
        var endY = Math.round(maxHeight * (this.endRow / this.rows.order.length));

        var pY = e.pageY - $(e.target).offset().top - ((endY - iniY) / 2);
        pY = (pY < 0 ? 0 : pY);
        this.offset.top = Math.round((pY / maxHeight) * this.rows.order.length);
        this.paint();
    };

    var vScrollMouseDown = false;

    this.onVScrollMouseDown = function(e) {
        e.preventDefault();

        vScrollMouseDown = true;
    }

    this.onVScrollMouseUp = function(e) {
        e.preventDefault();

        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
            return;
        }

        this.paint();
        vScrollMouseDown = false;
    }

    this.onVScrollMouseMove = function(e) {

        if (vScrollMouseDown) {
            var maxHeight = (this.endRow - this.startRow) * this.rows.zoom;
            var iniY = Math.round(maxHeight * (this.startRow / this.rows.order.length));
            var endY = Math.round(maxHeight * (this.endRow / this.rows.order.length));

            var pY = e.pageY - $(e.target).offset().top - ((endY - iniY) / 2);
            pY = (pY < 0 ? 0 : pY);
            this.offset.top = Math.round((pY / maxHeight) * this.rows.order.length);
            this.paint();
        }

    }

    var downX = null;
    var downY = null;

    this.onCellsMouseUp = function (e) {
        e.preventDefault();

        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
            return;
        }

        var position = $(e.target).offset();
        var pX = e.pageX - position.left - downX;
        var pY = e.pageY - position.top - downY;

        var c = Math.round(pX / this.cols.zoom);
        var r = Math.round(pY / this.rows.zoom);

        downX = null;
        downY = null;

        if (r == 0 && c == 0) {

            var col = Math.floor((e.originalEvent.pageX - position.left) / this.cols.zoom) + this.offset.left;
            var row = Math.floor((e.originalEvent.pageY - position.top) / this.rows.zoom) + this.offset.top;

            var cl = this.cols.values.length;
            var pos = this.rows.order[row] * cl + this.cols.order[col];
            var value = this.cells.values[pos];

            var details = $('table.heatmap div.detailsbox');
            if (value != null) {

                var boxTop = e.pageY - $(this.divHeatmap).offset().top;
                var boxLeft = e.pageX - $(this.divHeatmap).offset().left;
                var boxWidth;
                var boxHeight;


                var boxHtml = "<dl class='dl-horizontal'>";
                boxHtml += "<dt>Column</dt><dd>" + this.getColValueSelected(col) + "</dd>";
                boxHtml += "<dt>Row</dt><dd>" + this.getRowValueSelected(row) + "</dd>";
                boxHtml += "<hr />";
                for (var i = 0; i < this.cells.header.length; i++) {
                    if (this.cells.header[i] == undefined ) {
                        continue;
                    }
                    boxHtml += "<dt>" + this.cells.header[i] + ":</dt><dd>";
                    var val = value[i];
                    if (!isNaN(val) && (val%1 != 0)) {
                        val = Number(val).toFixed(3);
                    }
                    boxHtml += val;
                    boxHtml += "</dd>";
                }
                boxHtml += "</dl>";

                details.html(boxHtml);
                boxWidth = 300;
                boxHeight = 60 + (this.cells.header.length * 20);


                var wHeight = $(document).height();
                var wWidth = $(document).width();

                if (boxTop + boxHeight > wHeight) {
                    boxTop -= boxHeight;
                }

                if (boxLeft + boxWidth > wWidth) {
                    boxLeft -= boxWidth;
                }

                details.css('left', boxLeft);
                details.css('top', boxTop);
                details.css('width', boxWidth);
                details.css('height', boxHeight);

                details.css('display', 'block');
                details.bind('click', function () {
                    $(this).css('display', 'none');
                });
            } else {
                details.css('display', 'none');
            }

        }
        this.paint();
    };

    this.onCellsMouseMove = function(e) {
        e.preventDefault();

        if (downX != null) {
            var position = $(e.target).offset();
            var pX = e.pageX - position.left - downX;
            var pY = e.pageY - position.top - downY;

            var c = Math.round(pX / this.cols.zoom);
            var r = Math.round(pY / this.rows.zoom);

            if (!(r == 0 && c == 0)) {

                this.offset.top -= r;
                this.offset.left -= c;
                this.paint();
                downX = e.pageX - position.left;
                downY = e.pageY - position.top;
            }
        }

    };

    this.onCellsMouseDown = function (e) {
        e.preventDefault();

        var position = $(e.target).offset();
        downX = e.pageX - position.left;
        downY = e.pageY - position.top;

    };

    this.zoomHeatmap = function (zoomin, col, row) {

        var ncz = null;
        var nrz = null;
        if (zoomin) {

            ncz = this.rows.zoom + 3;
            ncz = ncz < 3 ? 3 : ncz;
            ncz = ncz > 32 ? 32 : ncz;

            // Zoom rows
            nrz = this.rows.zoom + 3;
            nrz = nrz < 3 ? 3 : nrz;
            nrz = nrz > 32 ? 32 : nrz;

            var ml = Math.round(col - this.offset.left - ((this.cols.zoom * (col - this.offset.left)) / ncz));
            var mt = Math.round(row - this.offset.top - ((this.rows.zoom * (row - this.offset.top)) / nrz));

            this.offset.left += ml;
            this.offset.top += mt;
        } else {

            ncz = this.cols.zoom - 3;
            ncz = ncz < 3 ? 3 : ncz;
            ncz = ncz > 32 ? 32 : ncz;

            // Zoom rows
            nrz = this.rows.zoom - 3;
            nrz = nrz < 3 ? 3 : nrz;
            nrz = nrz > 32 ? 32 : nrz;

            var ml = Math.round(col - this.offset.left - ((this.cols.zoom * (col - this.offset.left)) / ncz));
            var mt = Math.round(row - this.offset.top - ((this.rows.zoom * (row - this.offset.top)) / nrz));

            this.offset.left += ml;
            this.offset.top += mt;
        }

        if (!(nrz == this.rows.zoom && ncz == this.cols.zoom)) {
            this.cols.zoom = ncz;
            this.rows.zoom = nrz;
            this.paint();
        }
    };

    this.onCellsGestureEnd = function (e) {
        e.preventDefault();

        var col = Math.round(this.startCol + ((this.endCol - this.startCol) / 2));
        var row = Math.round(this.startRow + ((this.endRow - this.startRow) / 2));
        var zoomin = e.originalEvent.scale > 1;

        this.zoomHeatmap(zoomin, col, row);
    };

    this.onCellsGestureChange = function (e) {
        e.preventDefault();
    };

    this.onCellsMouseWheel = function (e, delta, deltaX, deltaY) {
        var heatmap = this;
        var pos = $(e.target).offset();
        var col = Math.floor((e.pageX - pos.left) / this.cols.zoom) + this.offset.left;
        var row = Math.floor((e.pageY - pos.top) / this.rows.zoom) + this.offset.top;
        var zoomin = delta / 120 > 0;
        this.zoomHeatmap(zoomin, col, row);
    };




    var rowsMouseDown = false;
    var rowsSelecting = true;
    var rowsDownColumn = null;
    var rowsShiftColumn = null;

    this.onRowsMouseDown = function (e) {
        rowsMouseDown = true;

        rowsShiftColumn = Math.floor((e.pageY - $(e.target).offset().top) / this.rows.zoom) + this.offset.top;
        rowsDownColumn = rowsShiftColumn;

        var index = $.inArray(this.rows.order[rowsDownColumn], this.rows.selected);
        if (index > -1) {
            rowsSelecting = false;
        } else {
            rowsSelecting = true;
        }
    }

    this.onRowsMouseUp = function(e) {
        rowsMouseDown = false;

        var row = Math.floor((e.pageY - $(e.target).offset().top) / this.rows.zoom) + this.offset.top;

        if (row == rowsDownColumn) {
            var index = $.inArray(this.rows.order[row], this.rows.selected);
            if (rowsSelecting) {
                if (index == -1) {
                    var x = e.pageX - $(e.target).offset().left;
                    if (x > 220) {
                        this.cols.sort.type = "single";
                        this.cols.sort.item = this.rows.order[row];
                        this.cols.sort.asc = !(this.cols.sort.asc);
                        this.cols.sort.field = this.cells.selectedValue;
                        this.applyColsSort();
                    } else {
                        this.rows.selected[this.rows.selected.length] = this.rows.order[row];
                    }
                }
            } else {

                var x = e.pageX - $(e.target).offset().left;
                if (x > 220) {
                    this.cols.sort.type = "value";
                    this.cols.sort.item = this.rows.selected.slice(0);
                    this.cols.sort.asc = !(this.cols.sort.asc);
                    this.cols.sort.field = this.cells.selectedValue;
                    this.applyColsSort();
                } else {
                    var unselectRows = [ row ];

                    for (var i = row + 1; i < this.rows.order.length ; i++) {
                        var index = $.inArray(this.rows.order[i], this.rows.selected);
                        if (index > -1) {
                            unselectRows[unselectRows.length] = i;
                        } else {
                            break;
                        }
                    }

                    for (var i = row - 1; i > 0 ; i--) {
                        var index = $.inArray(this.rows.order[i], this.rows.selected);
                        if (index > -1) {
                            unselectRows[unselectRows.length] = i;
                        } else {
                            break;
                        }
                    }

                    for (var i = 0; i < unselectRows.length; i++) {
                        var index = $.inArray(this.rows.order[unselectRows[i]], this.rows.selected);
                        this.rows.selected.splice(index, 1);
                    }
                }
            }
        }

        lastRowSelected = null;

        this.paint();
    }

    var lastRowSelected = null;
    this.onRowsMouseMove = function (e) {

        if (rowsMouseDown) {
            var row = Math.floor((e.pageY - $(e.target).offset().top) / this.rows.zoom) + this.offset.top;

            if (rowsSelecting) {
                var index = $.inArray(this.rows.order[row], this.rows.selected);
                if (index == -1) {
                    this.rows.selected[this.rows.selected.length] = this.rows.order[row];

                    // Select the gap
                    if (lastRowSelected != null && Math.abs(lastRowSelected - row) > 1) {
                        var upRow = (lastRowSelected < row ? lastRowSelected : row );
                        var downRow = (lastRowSelected < row ? row : lastRowSelected );
                        for (var i = upRow + 1; i < downRow; i++) {
                            this.rows.selected[this.rows.selected.length] = this.rows.order[i];
                        }
                    }
                    lastRowSelected = row;

                }
            } else {
                var diff = row - rowsShiftColumn;
                if (diff != 0) {
                    if (diff > 0) {
                        if ($.inArray(this.rows.order[this.rows.order.length - 1], this.rows.selected) == -1) {
                            for (var i = this.rows.order.length - 2; i >= 0; i--) {
                                var index = $.inArray(this.rows.order[i], this.rows.selected);
                                if (index != -1) {
                                    var nextRow = this.rows.order[i + 1];
                                    this.rows.order[i + 1] = this.rows.order[i];
                                    this.rows.order[i] = nextRow;
                                }
                            }
                        }
                    } else {
                        if ($.inArray(this.rows.order[0], this.rows.selected) == -1) {
                            for (var i = 1; i < this.rows.order.length; i++) {
                                var index = $.inArray(this.rows.order[i], this.rows.selected);
                                if (index != -1) {
                                    var prevRow = this.rows.order[i - 1];
                                    this.rows.order[i - 1] = this.rows.order[i];
                                    this.rows.order[i] = prevRow;
                                }
                            }
                        }
                    }
                    rowsShiftColumn = row;
                }
            }

            this.paint();
        }
    };

    this.onRowsKeyPress = function(e) {

        // 'H' or 'h'
        if (e.keyCode == 72 || e.charCode == 104) {
            var heatmap = this;
            if (heatmap.rows.selected.length > 0) {
                heatmap.rows.order = $.grep(heatmap.rows.order, function (value) {
                    return heatmap.rows.selected.indexOf(value) == -1;
                });
                heatmap.paint();
            }
        }

        // 'S' or 's'
        if (e.keyCode == 83 || e.charCode == 115) {
            var heatmap = this;
            heatmap.rows.order = [];
            for (var c = 0; c < heatmap.rows.values.length; c++) {
                heatmap.rows.order[heatmap.rows.order.length] = c;
            }
            heatmap.applyRowsSort();
            heatmap.paint();
        }

        // 'R' or 'r'
        if (e.keyCode == 82 || e.charCode == 114) {
            var heatmap = this;
            heatmap.rows.selected = [];
            heatmap.paint();
        }

        // 'D' or 'd'
//        if (e.keyCode == 68 || e.charCode == 100) {
//            var heatmap = this;
//            heatmap.applySort();
//            heatmap.paint();
//        }
    }


    var colsMouseDown = false;
    var colsSelecting = true;
    var colsDownColumn = null;
    var colsShiftColumn = null;

    this.onColsMouseDown = function (e) {
        colsMouseDown = true;

        colsShiftColumn = Math.floor((e.pageX - $(e.target).offset().left) / this.cols.zoom) + this.offset.left;
        colsDownColumn = colsShiftColumn;


        var index = $.inArray(this.cols.order[colsDownColumn], this.cols.selected);
        if (index > -1) {
            colsSelecting = false;
        } else {
            colsSelecting = true;
        }
    }

    this.onColsMouseUp = function(e) {
        colsMouseDown = false;

        var col = Math.floor((e.pageX - $(e.target).offset().left) / this.cols.zoom) + this.offset.left;

        if (col == colsDownColumn) {
            var index = $.inArray(this.cols.order[col], this.cols.selected);
            if (colsSelecting) {
                if (index == -1) {
                    var y = e.pageY - $(e.target).offset().top;
                    if (y > 140) {
                        this.rows.sort.type = "single";
                        this.rows.sort.field = this.cells.selectedValue;
                        this.rows.sort.item = this.cols.order[col];
                        this.rows.sort.asc = !(this.rows.sort.asc);
                        this.applyRowsSort();
                    } else {
                        this.cols.selected[this.cols.selected.length] = this.cols.order[col];
                    }
                }
            } else {
                var y = e.pageY - $(e.target).offset().top;
                if (y > 140) {
                    this.rows.sort.type = "value";
                    this.rows.sort.item = this.cols.selected.slice(0);
                    this.rows.sort.asc = !(this.rows.sort.asc);
                    this.rows.sort.field = this.cells.selectedValue;
                    this.applyRowsSort();
                } else {
                    var unselectCols = [ col ];

                    for (var i = col + 1; i < this.cols.order.length ; i++) {
                        var index = $.inArray(this.cols.order[i], this.cols.selected);
                        if (index > -1) {
                            unselectCols[unselectCols.length] = i;
                        } else {
                            break;
                        }
                    }

                    for (var i = col - 1; i > 0 ; i--) {
                        var index = $.inArray(this.cols.order[i], this.cols.selected);
                        if (index > -1) {
                            unselectCols[unselectCols.length] = i;
                        } else {
                            break;
                        }
                    }

                    for (var i = 0; i < unselectCols.length; i++) {
                       var index = $.inArray(this.cols.order[unselectCols[i]], this.cols.selected);
                       this.cols.selected.splice(index, 1);
                    }
                }
            }
        }

        lastColSelected = null;

        this.paint();
    }

    var lastColSelected = null;

    this.onColsMouseMove = function (e) {

        if (colsMouseDown) {
            var col = Math.floor((e.pageX - $(e.target).offset().left) / this.cols.zoom) + this.offset.left;

            if (colsSelecting) {
                var index = $.inArray(this.cols.order[col], this.cols.selected);
                if (index == -1) {
                    this.cols.selected[this.cols.selected.length] = this.cols.order[col];

                    // Select the gap
                    if (lastColSelected != null && Math.abs(lastColSelected - col) > 1) {
                        var upCol = (lastColSelected < col ? lastColSelected : col );
                        var downCol = (lastColSelected < col ? col : lastColSelected );
                        for (var i = upCol + 1; i < downCol; i++) {
                            this.cols.selected[this.cols.selected.length] = this.cols.order[i];
                        }
                    }
                    lastColSelected = col;
                }
            } else {
                var diff = col - colsShiftColumn;
                if (diff != 0) {
                    if (diff > 0) {
                        if ($.inArray(this.cols.order[this.cols.order.length - 1], this.cols.selected) == -1) {
                            for (var i = this.cols.order.length - 2; i >= 0; i--) {
                                var index = $.inArray(this.cols.order[i], this.cols.selected);
                                if (index != -1) {
                                    var nextCol = this.cols.order[i + 1];
                                    this.cols.order[i + 1] = this.cols.order[i];
                                    this.cols.order[i] = nextCol;
                                }
                            }
                        }
                    } else {
                        if ($.inArray(this.cols.order[0], this.cols.selected) == -1) {
                            for (var i = 1; i < this.cols.order.length; i++) {
                                var index = $.inArray(this.cols.order[i], this.cols.selected);
                                if (index != -1) {
                                    var prevCol = this.cols.order[i - 1];
                                    this.cols.order[i - 1] = this.cols.order[i];
                                    this.cols.order[i] = prevCol;
                                }
                            }
                        }
                    }
                    colsShiftColumn = col;
                }
            }

            this.paint();
        }
    };

    this.onColsKeyPress = function(e) {

        // 'H' or 'h'
        if (e.charCode == 72 || e.charCode == 104) {
            var heatmap = this;
            if (heatmap.cols.selected.length > 0) {
                heatmap.cols.order = $.grep(heatmap.cols.order, function (value) {
                    return heatmap.cols.selected.indexOf(value) == -1;
                });
                heatmap.paint();
            }
        }

        // 'S' or 's'
        if (e.keyCode == 83 || e.charCode == 115) {
            var heatmap = this;
            heatmap.cols.order = [];
            for (var c = 0; c < heatmap.cols.values.length; c++) {
                heatmap.cols.order[heatmap.cols.order.length] = c;
            }
            heatmap.applyColsSort();
            heatmap.paint();
        }

        // 'R' or 'r'
        if (e.keyCode == 82 || e.charCode == 114) {
            var heatmap = this;
            heatmap.cols.selected = [];
            heatmap.paint();
        }

    }

    this.handleFocus= function(e) {

        if(e.type=='mouseover'){
            e.target.focus();
            return false;
        } else if(e.type=='mouseout'){
            e.target.blur();
            return false;
        }

        return true;
    };

    this.reindexArray = function(values, headers) {
        for(var index in values) {
            if (isNaN(index)) {
                i = jQuery.inArray(index, headers);
                values[i] = values[index];
                values[index] = undefined;
            }
        }
    }

    this.convertToIndexArray = function(values, headers) {
        for (var index in values) {
            values[index] = this.reindexField(values[index], headers);
        }
    }

    this.reindexField = function(value, headers) {
        if (isNaN(value)) {
            i = jQuery.inArray(value, headers);

            if (i > -1) {
                return i;
            }
        }

        return value;
    }

    this.reindex = function() {

        var heatmap = this;

        // Reindex configuration. Needed to let the user use position or header id interchangeably
        this.reindexArray(heatmap.cells.decorators, heatmap.cells.header);
        this.reindexArray(heatmap.cells.aggregators, heatmap.cells.header);
        this.reindexArray(heatmap.cols.decorators, heatmap.cols.header);
        this.reindexArray(heatmap.cols.aggregators, heatmap.cols.header);
        this.convertToIndexArray(heatmap.cols.annotations, heatmap.cols.header);
        this.reindexArray(heatmap.rows.decorators, heatmap.rows.header);
        this.reindexArray(heatmap.rows.aggregators, heatmap.rows.header);
        this.convertToIndexArray(heatmap.rows.annotations, heatmap.rows.header);

        if (heatmap.filters != undefined) {
            for(var key in heatmap.filters) {
                this.convertToIndexArray(heatmap.filters[key].fields, heatmap.cells.header);
            }
        }

        if (heatmap.rows.filters != undefined) {
            for(var key in heatmap.rows.filters) {
                this.convertToIndexArray(heatmap.rows.filters[key].fields, heatmap.cells.header);
            }
        }

        if (heatmap.cols.filters != undefined) {
            for(var key in heatmap.cols.filters) {
                this.convertToIndexArray(heatmap.cols.filters[key].fields, heatmap.cells.header);
            }
        }

        heatmap.rows.sort.field = this.reindexField(heatmap.rows.sort.field, heatmap.cells.header);
        heatmap.cols.sort.field = this.reindexField(heatmap.cols.sort.field, heatmap.cells.header);
        heatmap.cells.selectedValue = this.reindexField(heatmap.cells.selectedValue, heatmap.cells.header)

    }

};
