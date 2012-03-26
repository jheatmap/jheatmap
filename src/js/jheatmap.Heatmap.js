/**
 *
 * Heatmap interactive viewer
 *
 * @author Jordi Deu-Pons
 * @class
 */
jheatmap.Heatmap = function () {

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
     * Internal property to track when the loaded files
     * are ready
     *
     * @private
     */
    this.sync = false;

    /**
     * Show the indication "click to jump here" when the
     * mouse is hovering the scrollbars.
     *
     * @private
     */
    this.showScrollBarTooltip = true;

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

            this.rows.order.sort(function (o_a, o_b) {
                var v_a = heatmap.rows.values[o_a][heatmap.rows.sort.field].toLowerCase();
                var v_b = heatmap.rows.values[o_b][heatmap.rows.sort.field].toLowerCase();
                var val = (heatmap.rows.sort.asc ? 1 : -1);
                return (v_a == v_b) ? 0 : (v_a > v_b ? val : -val);
            });
        } else if (this.rows.sort.type == "value") {
            var aggregation = [];

            var cl = this.cols.values.length;
            for (var r = 0; r < this.rows.order.length; r++) {
                var values = [];
                for (var c = 0; c < this.cols.order.length; c++) {
                    var pos = this.rows.order[r] * cl + this.cols.order[c];
                    var value = this.cells.values[pos];
                    if (value != null) {
                        values.push(value[this.rows.sort.field]);
                    }
                }
                aggregation[this.rows.order[r]] = sum = this.cells.aggregators[this.rows.sort.field].acumulate(values);
            }

            this.rows.order.sort(function (o_a, o_b) {
                var v_a = aggregation[o_a];
                var v_b = aggregation[o_b];
                var val = (heatmap.rows.sort.asc ? 1 : -1);
                return (v_a == v_b) ? 0 : (v_a > v_b ? val : -val);
            });
        } else if (this.rows.sort.type == "single") {

            this.rows.order.sort(function (o_a, o_b) {
                var pos_a = (o_a * heatmap.cols.values.length) + heatmap.rows.sort.item;
                var pos_b = (o_b * heatmap.cols.values.length) + heatmap.rows.sort.item;

                var value_a = heatmap.cells.values[pos_a];
                var value_b = heatmap.cells.values[pos_b];

                var v_a = (value_a == null ? null : parseFloat(value_a[heatmap.rows.sort.field]));
                var v_b = (value_b == null ? null : parseFloat(value_b[heatmap.rows.sort.field]));

                var val = (heatmap.rows.sort.asc ? 1 : -1);
                return (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
            });
        }
    };

    /**
     * Sort all the columns
     */
    this.applyColsSort = function () {
        var heatmap = this;

        if (this.cols.sort.type == "label") {
            this.cols.order.sort(function (o_a, o_b) {
                var v_a = heatmap.cols.values[o_a][heatmap.cols.sort.field].toLowerCase();
                var v_b = heatmap.cols.values[o_b][heatmap.cols.sort.field].toLowerCase();
                var val = (heatmap.cols.sort.asc ? 1 : -1);
                return (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
            });

        } else if (this.cols.sort.type == "value") {
            var aggregation = [];
            var cl = this.cols.values.length;

            var cols = this.cols.order;
            var rows = this.rows.order;

            for (var c = 0; c < cols.length; c++) {
                var values = [];
                for (var r = 0; r < rows.length; r++) {
                    var pos = rows[r] * cl + cols[c];
                    var value = this.cells.values[pos];
                    if (value != null) {
                        values.push(value[this.cols.sort.field]);
                    }
                }
                aggregation[cols[c]] = this.cells.aggregators[this.cells.selectedValue].acumulate(values);
            }

            this.cols.order.sort(function (o_a, o_b) {
                var v_a = aggregation[o_a];
                var v_b = aggregation[o_b];
                var val = (heatmap.cols.sort.asc ? 1 : -1);
                return (v_a == v_b) ? 0 : (v_a > v_b ? val : -val);
            });

        } else if (this.cols.sort.type == "single") {

            pos = this.cols.sort.item * this.cols.values.length;
            this.cols.order.sort(function (o_a, o_b) {
                var value_a = heatmap.cells.values[pos + o_a];
                var value_b = heatmap.cells.values[pos + o_b];
                var v_a = (value_a == null ? null : parseFloat(value_a[heatmap.cols.sort.field]));
                var v_b = (value_b == null ? null : parseFloat(value_b[heatmap.cols.sort.field]));
                var val = (heatmap.cols.sort.asc ? 1 : -1);
                return (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
            });
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
        $('div.heatmap-loader').show();
        var interval = window.setInterval(function () {
            runme.call(this);
            $('div.heatmap-loader').hide();
            window.clearInterval(interval);
        }, 1);
    };

    /**
     * Paint the heatmap on 'obj' element.
     * @param obj
     */
    this.paint = function (obj) {
        var heatmap = this;

        var chooseOrderImage = function (type) {

            if (type == "cols_by_label") {
                if (heatmap.cols.sort.type != "label") {
                    return basePath + "/images/cln.png";
                } else if (heatmap.cols.sort.field != heatmap.cols.selectedValue) {
                    return basePath + "/images/cln.png";
                } else {
                    return basePath + (heatmap.cols.sort.asc ? "/images/cll.png" : "/images/clr.png");
                }
            }

            if (type == "rows_by_label") {
                if (heatmap.rows.sort.type != "label") {
                    return basePath + "/images/rln.png";
                } else if (heatmap.rows.sort.field != heatmap.rows.selectedValue) {
                    return basePath + "/images/rln.png";
                } else {
                    return basePath + (heatmap.rows.sort.asc ? "/images/rlu.png" : "/images/rld.png");
                }
            }

            if (type == "cols_by_value") {
                if (heatmap.cols.sort.type != "value") {
                    return basePath + "/images/cvn.png";
                } else if (heatmap.cols.sort.field != heatmap.cells.selectedValue) {
                    return basePath + "/images/cvn.png";
                } else {
                    return basePath + (heatmap.cols.sort.asc ? "/images/cvr.png" : "/images/cvl.png");
                }
            }

            if (type == "rows_by_value") {
                if (heatmap.rows.sort.type != "value") {
                    return basePath + "/images/rvn.png";
                } else if (heatmap.rows.sort.field != heatmap.cells.selectedValue) {
                    return basePath + "/images/rvn.png";
                } else {
                    return basePath + (heatmap.rows.sort.asc ? "/images/rvd.png" : "/images/rvu.png");
                }
            }
        };

        // Minimum zooms
        var mcz = Math.max(3, Math.round(this.size.width / this.cols.order.length));
        var mrz = Math.max(3, Math.round(this.size.height / this.rows.order.length));

        // Zoom columns
        var cz = this.cols.zoom;
        cz = cz < mcz ? mcz : cz;
        cz = cz > 32 ? 32 : cz;
        this.cols.zoom = cz;

        // Zoom rows
        var rz = this.rows.zoom;
        rz = rz < mrz ? mrz : rz;
        rz = rz > 32 ? 32 : rz;
        this.rows.zoom = rz;

        var maxCols = Math.min(this.cols.order.length, Math.round(this.size.width / cz) + 1);
        var maxRows = Math.min(this.rows.order.length, Math.round(this.size.height / rz) + 1);

        var top = this.offset.top;
        if (top < 0) {
            top = 0;
        }
        if (top > (this.rows.order.length - maxRows)) {
            top = (this.rows.order.length - maxRows);
        }
        this.offset.top = top;

        var left = this.offset.left;
        if (left < 0) {
            left = 0;
        }
        if (left > (this.cols.order.length - maxCols)) {
            left = (this.cols.order.length - maxCols);
        }
        this.offset.left = left;

        var startRow = this.offset.top;
        var endRow = Math.min(this.offset.top + maxRows, this.rows.order.length);

        var startCol = this.offset.left;
        var endCol = Math.min(this.offset.left + maxCols, this.cols.order.length);

        // Loader
        obj.html('<div class="heatmap-loader"><div class="background"></div><div class="progress"><img src="'
            + basePath + '/images/loading.gif"></div></div>');

        var table = $("<table>", {
            "class":"heatmap"
        });

        // top border
        var borderTop = $('<tr>', {
            'class':'border'
        });
        borderTop.append('<td><div class="detailsbox">cell details here</div></td>');

        /*
         * TOP TOOLBAR
         */

        var textSpacing = 5;

        var topToolbar = $("<td>", { colspan: (heatmap.rows.annotations.length > 0 ? 3 : 2) });

        // Order columns by label
        topToolbar.append($('<img>', {
            'src':chooseOrderImage.call(this, "cols_by_label"),
            'title':"Sort columns by label"
        }).click(function () {
                heatmap.loading(function () {
                    heatmap.sortColsByLabel(heatmap.cols.selectedValue, !heatmap.cols.sort.asc);
                    heatmap.paint(obj);
                });
            }));

        // Order columns by value
        topToolbar.append($('<img>', {
            'src':chooseOrderImage.call(this, "cols_by_value"),
            'title':"Sort columns by value"
        }).click(function () {
                heatmap.loading(function () {
                    heatmap.sortColsByValue(!heatmap.cols.sort.asc);
                    heatmap.paint(obj);
                });
            }));

        // Separator
        topToolbar.append($('<img>', {
            'src':basePath + "/images/sep.png"
        }));

        // Zoom cols -
        topToolbar.append($('<img>', {
            'src':basePath + "/images/z_less.png",
            'title':"Decrease columns width"
        }).click(function () {
                heatmap.cols.zoom = heatmap.cols.zoom - 3;
                heatmap.paint(obj);
            }));

        // Zoom cols +
        topToolbar.append($('<img>', {
            'src':basePath + "/images/z_plus.png",
            'title':"Increase columns width"
        }).click(function () {
                heatmap.cols.zoom = heatmap.cols.zoom + 3;
                heatmap.paint(obj);
            }));

        // Separator
        topToolbar.append($('<img>', {
            'src':basePath + "/images/sep.png"
        }));

        // Move left
        topToolbar.append($('<img>', {
            'src':basePath + "/images/hl.png",
            'title':"Move selected columns to the left"
        }).click(function () {
                if (heatmap.cols.selected.length > 0) {
                    if ($.inArray(heatmap.cols.order[0], heatmap.cols.selected) == -1) {
                        for (var i = 1; i < heatmap.cols.order.length; i++) {
                            var index = $.inArray(heatmap.cols.order[i], heatmap.cols.selected);
                            if (index != -1) {
                                var prevCol = heatmap.cols.order[i - 1];
                                heatmap.cols.order[i - 1] = heatmap.cols.order[i];
                                heatmap.cols.order[i] = prevCol;
                            }
                        }
                        heatmap.paint(obj);
                    }
                }
            }));

        // Move rigth
        topToolbar.append($('<img>', {
            'src':basePath + "/images/hr.png",
            'title':"Move selected columns to the right"
        }).click(function () {
                if (heatmap.cols.selected.length > 0) {
                    if ($.inArray(heatmap.cols.order[heatmap.cols.order.length - 1], heatmap.cols.selected) == -1) {
                        for (var i = heatmap.cols.order.length - 2; i >= 0; i--) {
                            var index = $.inArray(heatmap.cols.order[i], heatmap.cols.selected);
                            if (index != -1) {
                                var nextCol = heatmap.cols.order[i + 1];
                                heatmap.cols.order[i + 1] = heatmap.cols.order[i];
                                heatmap.cols.order[i] = nextCol;
                            }
                        }
                        heatmap.paint(obj);
                    }
                }
            }));

        // Separator
        topToolbar.append($('<img>', {
            'src':basePath + "images/sep.png"
        }));

        // Select none
        topToolbar.append($('<img>', {
            'src':basePath + "/images/shnone.png",
            'title':"Unselect all columns"
        }).click(function () {
                heatmap.cols.selected = [];
                heatmap.paint(obj);
            }));

        // Select all visible
        topToolbar.append($('<img>', {
            'src':basePath + "/images/shall.png",
            'title':"Select all visible columns"
        }).click(function () {
                heatmap.cols.selected = heatmap.cols.order.slice(0);
                heatmap.paint(obj);
            }));

        // Hide
        topToolbar.append($('<img>', {
            'src':basePath + "/images/hide.png",
            'title':"Hide selected columns"
        }).click(function () {
                if (heatmap.cols.selected.length > 0) {
                    heatmap.cols.order = $.grep(heatmap.cols.order, function (value) {
                        return heatmap.cols.selected.indexOf(value) == -1;
                    });
                    heatmap.paint(obj);
                }
            }));

        // Unhide
        topToolbar.append($('<img>', {
            'src':basePath + "/images/unhide.png",
            'title':"Unhide selected columns"
        }).click(function () {
                heatmap.cols.order = [];
                for (var c = 0; c < heatmap.cols.values.length; c++) {
                    heatmap.cols.order[heatmap.cols.order.length] = c;
                }
                heatmap.applyColsSort();
                heatmap.paint(obj);
            }));


        // Separator
        topToolbar.append($('<img>', {
            'src':basePath + "images/sep.png"
        }));

        // Fullscreen
        topToolbar.append($('<img>', {
            'src':basePath + "images/" + (heatmap.size.fullscreen ? "nofull.png" : "full.png"),
            'title':(heatmap.size.fullscreen ? "Resize to original heatmap size" : "Resize to fit window size")
        }).click(function () {

                if (heatmap.size.fullscreen) {
                    heatmap.size.width = heatmap.size.fullscreen.width;
                    heatmap.size.height = heatmap.size.fullscreen.height;
                    delete heatmap.size.fullscreen;
                } else {
                    var wHeight = $(window).height();
                    var wWidth = $(window).width();

                    heatmap.size.fullscreen = {
                        width:heatmap.size.width,
                        height:heatmap.size.height
                    };


                    heatmap.size.width = wWidth - 290 - (14 * heatmap.cols.annotations.length);
                    heatmap.size.height = wHeight - 290 - (10 * heatmap.rows.annotations.length);
                }

                heatmap.paint(obj);

            }));

        // Separator
        topToolbar.append($('<img>', {
            'src':basePath + "images/sep.png"
        }));

        // Search
        var searchFunction = function () {
            heatmap.search = searchField.val();
            if (heatmap.search == "") {
                heatmap.search = null;
            }
            heatmap.paint(obj);
        };

        var searchField = $("<input>", {
            'type':'search',
            'placeholder':"Search...",
            'name':"jheatmap-search",
            'value':heatmap.search
        });

        searchField.bind('search', function () {
            searchFunction();
        });

        topToolbar.append(searchField);

        borderTop.append(topToolbar);
        borderTop.append("<th class='border'></th>");
        borderTop.append($("<th class='border'>").append($('<img>', {
            'src':basePath + "/images/sep.png"
        })));
        table.append(borderTop);

        var firstRow = $("<tr>");
        table.append(firstRow);

        /*
         * LEFT TOOLBAR
         */

        var leftToolbar = $('<th>', {
            'class':'border',
            'rowspan':2 + (heatmap.cols.annotations.length > 0 ? 1 : 0),
            'style': 'max-width: 25px;'
        });
        firstRow.append(leftToolbar);

        // Sort rows by label
        leftToolbar.append($('<img>', {
            'src':chooseOrderImage.call(this, "rows_by_label"),
            'title':"Sort rows by label"
        }).click(function () {
                heatmap.loading(function () {
                    heatmap.sortRowsByLabel(heatmap.rows.selectedValue, !heatmap.rows.sort.asc);
                    heatmap.paint(obj);
                });
            }));
        leftToolbar.append($("<br>"));

        // Sort rows by value
        leftToolbar.append($('<img>', {
            'src':chooseOrderImage.call(this, "rows_by_value"),
            'title':"Sort rows by value"
        }).click(function () {
                heatmap.loading(function () {
                    heatmap.sortRowsByValue(!heatmap.rows.sort.asc);
                    heatmap.paint(obj);
                });
            }));
        leftToolbar.append($("<br>"));

        // Separator
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/sep.png"
        }));

        // Zoom rows -
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/z_less.png",
            'title':"Decrease rows height"
        }).click(function () {
                heatmap.rows.zoom = heatmap.rows.zoom - 3;
                heatmap.paint(obj);
            }));
        leftToolbar.append($('<br>'));

        // Zoom rows +
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/z_plus.png",
            'title':"Increase rows height"
        }).click(function () {
                heatmap.rows.zoom = heatmap.rows.zoom + 3;
                heatmap.paint(obj);
            }));
        leftToolbar.append($('<br>'));

        // Separator
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/sep.png"
        }));
        leftToolbar.append($('<br>'));

        // Move up
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/vu.png",
            'title':"Move selected columns up"
        }).click(function () {
                if (heatmap.rows.selected.length > 0) {
                    if ($.inArray(heatmap.rows.order[0], heatmap.rows.selected) == -1) {
                        for (var i = 1; i < heatmap.rows.order.length; i++) {
                            var index = $.inArray(heatmap.rows.order[i], heatmap.rows.selected);
                            if (index != -1) {
                                var prevRow = heatmap.rows.order[i - 1];
                                heatmap.rows.order[i - 1] = heatmap.rows.order[i];
                                heatmap.rows.order[i] = prevRow;
                            }
                        }
                        heatmap.paint(obj);
                    }
                }
            }));
        leftToolbar.append($('<br>'));

        // Move down
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/vd.png",
            'title':"Move selected columns down"
        }).click(function () {
                if (heatmap.rows.selected.length > 0) {
                    if ($.inArray(heatmap.rows.order[heatmap.rows.order.length - 1], heatmap.rows.selected) == -1) {
                        for (var i = heatmap.rows.order.length - 2; i >= 0; i--) {
                            var index = $.inArray(heatmap.rows.order[i], heatmap.rows.selected);
                            if (index != -1) {
                                var nextRow = heatmap.rows.order[i + 1];
                                heatmap.rows.order[i + 1] = heatmap.rows.order[i];
                                heatmap.rows.order[i] = nextRow;
                            }
                        }
                        heatmap.paint(obj);
                    }
                }
            }));

        // Separator
        leftToolbar.append($('<img>', {
            'src':basePath + "images/sep.png"
        }));
        leftToolbar.append($('<br>'));

        // Select none
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/svnone.png",
            'title':"Unselect all selected rows"
        }).click(function () {
                heatmap.rows.selected = [];
                heatmap.paint(obj);
            }));
        leftToolbar.append($('<br>'));

        // Select all visible
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/svall.png",
            'title':"Select all visible rows"
        }).click(function () {
                heatmap.rows.selected = heatmap.rows.order.slice(0);
                heatmap.paint(obj);
            }));
        leftToolbar.append($('<br>'));

        // Hide
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/hide.png",
            'title':"Hide selected rows"
        }).click(function () {
                if (heatmap.rows.selected.length > 0) {
                    heatmap.rows.order = $.grep(heatmap.rows.order, function (value) {
                        return heatmap.rows.selected.indexOf(value) == -1;
                    });
                    heatmap.paint(obj);
                }
            }));
        leftToolbar.append($('<br>'));

        // Unhide
        leftToolbar.append($('<img>', {
            'src':basePath + "/images/unhide.png",
            'title':"Unhide selected rows"
        }).click(function () {
                heatmap.rows.order = [];
                for (var c = 0; c < heatmap.rows.values.length; c++) {
                    heatmap.rows.order[heatmap.rows.order.length] = c;
                }
                heatmap.applyRowsFilters();
                heatmap.applyRowsSort();
                heatmap.paint(obj);
            }));
        leftToolbar.append($('<br>'));


        /*
         * TOP-LEFT PANEL
         */

        var topleftPanel = $("<th>", {
            "class":"topleft"
        });
        firstRow.append(topleftPanel);

        // Add filters
        for (var filterId in heatmap.filters) {

            var filterDef = heatmap.filters[filterId];

            if ($.inArray(heatmap.cells.selectedValue, filterDef.fields) > -1) {

                var checkInput = $('<input type="checkbox">');
                checkInput.prop('checked', heatmap.getRowsFilter(filterId));
                checkInput.click(function () {
                    var checkbox = $(this);
                    heatmap.loading(function () {
                        if (checkbox.is(':checked')) {
                            heatmap.addRowsFilter(filterId);
                        } else {
                            heatmap.removeRowsFilter(filterId);
                        }
                        heatmap.applyRowsFilters();
                        heatmap.paint(obj);
                    });
                });

                topleftPanel.append($('<div>', {
                    'class':'filter'
                }).append(checkInput).append($('<span>').html(filterDef.title)));

            }
        }

        // Add column selector
        var selectCol = $("<select>").change(function () {
            var value = $(this)[0].value;
            heatmap.cols.selectedValue = value;
            heatmap.loading(function () {
                heatmap.paint(obj);
            });
        });
        topleftPanel.append(selectCol);
        for (var o = 0; o < this.cols.header.length; o++) {
            selectCol.append(new Option(this.cols.header[o], o, o == this.cols.selectedValue));
        }
        selectCol.val(this.cols.selectedValue);
        topleftPanel.append($("<span>Columns</span>"));
        topleftPanel.append($("<br>"));

        // Add row selector
        var selectRow = $("<select>").change(function () {
            heatmap.rows.selectedValue = $(this)[0].value;
            heatmap.loading(function () {
                heatmap.paint(obj);
            });
        });
        topleftPanel.append(selectRow);
        topleftPanel.append($("<span>Rows</span>"));
        topleftPanel.append($("<br>"));

        for (o = 0; o < this.rows.header.length; o++) {
            selectRow.append(new Option(this.rows.header[o], o, o == this.rows.selectedValue));
        }
        selectRow.val(this.rows.selectedValue);

        // Add cell selector
        var selectCell = $("<select>").change(function () {
            var value = $(this)[0].value;
            heatmap.cells.selectedValue = value;
            heatmap.loading(function () {
                heatmap.paint(obj);
            });
        });
        topleftPanel.append(selectCell);
        topleftPanel.append($("<span>Cells</span>"));
        topleftPanel.append($("<br>"));

        for (o = 0; o < this.cells.header.length; o++) {
            selectCell.append(new Option(this.cells.header[o], o, o == this.cells.selectedValue));
        }
        selectCell.val(this.cells.selectedValue);

        /*******************************************************************
         * COLUMN HEADERS *
         ******************************************************************/

            // Add column headers
        var colHeader = $("<th>");
        firstRow.append(colHeader);

        var colCanvas = $("<canvas id='colCanvas' width='" + heatmap.size.width + "' height='150'></canvas>");
        colCanvas.click(function (e) {
            var pos = $(this).position();
            var col = heatmap.cols.order[Math.floor((e.pageX - pos.left) / cz) + heatmap.offset.left];

            var index = $.inArray(col, heatmap.cols.selected);
            if (index > -1) {
                heatmap.cols.selected.splice(index, 1);
            } else {
                heatmap.cols.selected[heatmap.cols.selected.length] = col;
            }
            heatmap.paint(obj);

        });
        colHeader.append(colCanvas);

        var colCtx = colCanvas.get()[0].getContext('2d');

        colCtx.fillStyle = "black";
        colCtx.textAlign = "right";
        colCtx.textBaseline = "middle";
        colCtx.font = (cz > 12 ? 12 : cz) + "px Verdana";

        for (var c = startCol; c < endCol; c++) {
            var value = heatmap.getColValueSelected(c);
            colCtx.save();
            colCtx.translate((c - startCol) * cz + (cz / 2), 150);
            colCtx.rotate(Math.PI / 2);
            colCtx.fillText(value, -textSpacing, 0);
            colCtx.restore();

            if ($.inArray(heatmap.cols.order[c], heatmap.cols.selected) > -1) {
                colCtx.fillStyle = "rgba(0,0,0,0.2)";
                colCtx.fillRect((c - startCol) * cz, 0, cz, 150);
                colCtx.fillStyle = "black";
            }

            if (heatmap.search != null && value.toUpperCase().indexOf(heatmap.search.toUpperCase()) != -1) {
                colCtx.fillStyle = "rgba(255,255,0,0.3)";
                colCtx.fillRect((c - startCol) * cz, 0, cz, 150);
                colCtx.fillStyle = "black";
            }
        }

        /*******************************************************************
         * ADD ROW HEADER ANNOTATIONS
         ******************************************************************/

        var rowspan = (heatmap.cols.annotations.length > 0 ? 2 : 1);
        
        if (heatmap.rows.annotations.length > 0) {

            var annRowHead = $("<th>", {
                'class':'border-rows-ann',
                'rowspan':rowspan
            });
            firstRow.append(annRowHead);

            var annRowHeadCanvas = $("<canvas width='" + 10 * heatmap.rows.annotations.length
                + "' height='150'></canvas>");
            annRowHead.append(annRowHeadCanvas);
            var annRowHeadCtx = annRowHeadCanvas.get()[0].getContext('2d');
            annRowHeadCtx.fillStyle =  "rgb(51,51,51)"; /* = #333 , like the borders */
            annRowHeadCtx.textAlign = "right";
            annRowHeadCtx.textBaseline = "middle";
            annRowHeadCtx.font = "bold 11px Verdana";

            for (var i = 0; i < heatmap.rows.annotations.length; i++) {

                var value = heatmap.rows.header[heatmap.rows.annotations[i]];
                annRowHeadCtx.save();
                annRowHeadCtx.translate(i * 10 + 5, 150);
                annRowHeadCtx.rotate(Math.PI / 2);
                annRowHeadCtx.fillText(value, -textSpacing, 0);
                annRowHeadCtx.restore();
            }

            annRowHeadCanvas.click(function (e) {
                var pos = $(this).position();
                var i = Math.floor((e.pageX - pos.left) / 10);

                heatmap.sortRowsByLabel(heatmap.rows.annotations[i], !heatmap.rows.sort.asc);
                heatmap.paint(obj);

            });



        }

        firstRow.append($("<th>", {
            'class':'border',
            'rowspan':rowspan
        }));

        firstRow.append($("<th>", {
            'class':'border',
            'rowspan':rowspan
        }));




        /*******************************************************************
         * ADD COLUMN ANNOTATIONS
         ******************************************************************/

        if (heatmap.cols.annotations.length > 0) {

            firstRow = $("<tr class='annotations'>");
            table.append(firstRow);

            var colAnnHeaderCell = $("<th>", {
                "class":"border-cols-ann"
            });
            var colAnnHeaderCanvas = $("<canvas style='float:right;' width='200' height='" + 10
                * heatmap.cols.annotations.length + "'></canvas>");
            colAnnHeaderCell.append(colAnnHeaderCanvas);
            firstRow.append(colAnnHeaderCell);

            var colAnnHeaderCtx = colAnnHeaderCanvas.get()[0].getContext('2d');
            colAnnHeaderCtx.fillStyle = "rgb(51,51,51)"; /* = #333 , like the borders */
            colAnnHeaderCtx.textAlign = "right";
            colAnnHeaderCtx.textBaseline = "middle";
            colAnnHeaderCtx.font = "bold 11px Verdana";

            for (i = 0; i < heatmap.cols.annotations.length; i++) {
                var value = heatmap.cols.header[heatmap.cols.annotations[i]];
                colAnnHeaderCtx.fillText(value, 200 - textSpacing, (i * 10) + 5);
            }

            var colAnnValuesCell = $("<th>");
            var colAnnValuesCanvas = $("<canvas width='" + heatmap.size.width + "' height='" + 10
                * heatmap.cols.annotations.length + "'></canvas>");
            colAnnValuesCell.append(colAnnValuesCanvas);
            firstRow.append(colAnnValuesCell);

            var colAnnValuesCtx = colAnnValuesCanvas.get()[0].getContext('2d');

            for (i = 0; i < heatmap.cols.annotations.length; i++) {
                for (var col = startCol; col < endCol; col++) {

                    var field = heatmap.cols.annotations[i];
                    value = heatmap.getColValue(col, field);

                    if (value != null) {
                        //var color = cols.decorators[field].call(this, value);
                        var color = heatmap.cols.decorators[field].toColor(value);
                        colAnnValuesCtx.fillStyle = color;
                        colAnnValuesCtx.fillRect((col - startCol) * cz, i * 10, cz, 10);
                    }
                }
            }

            for (var col = startCol; col < endCol; col++) {
                if ($.inArray(heatmap.cols.order[col], heatmap.cols.selected) > -1) {
                    colAnnValuesCtx.fillStyle = "rgba(0,0,0,0.2)";
                    colAnnValuesCtx.fillRect((col - startCol) * cz, 0, cz, heatmap.cols.annotations.length * 10);
                    colAnnValuesCtx.fillStyle = "white";
                }
            }

            colAnnHeaderCanvas.click(function (e) {
                var pos = $(this).position();
                var i = Math.floor((e.pageY - pos.top) / 10);

                heatmap.sortColsByLabel(heatmap.cols.annotations[i], !heatmap.cols.sort.asc);
                heatmap.paint(obj);

            });

        }

        // Add left border
        var tableRow = $('<tr>');

        /*******************************************************************
         * ROWS HEADERS *
         ******************************************************************/

        var rowsCell = $("<td>", {
            "class":"row"
        });

        var rowsCanvas = $("<canvas width='230' height='" + heatmap.size.height + "'></canvas>");

        rowsCanvas.click(function (e) {
            var pos = $(this).position();
            var row = heatmap.rows.order[Math.floor((e.pageY - pos.top) / rz) + heatmap.offset.top];

            var index = $.inArray(row, heatmap.rows.selected);
            if (index > -1) {
                heatmap.rows.selected.splice(index, 1);
            } else {
                heatmap.rows.selected[heatmap.rows.selected.length] = row;
            }
            heatmap.paint(obj);
        });

        rowsCell.append(rowsCanvas);
        tableRow.append(rowsCell);

        var rowCtx = rowsCanvas.get()[0].getContext('2d');
        rowCtx.fillStyle = "black";
        rowCtx.textAlign = "right";
        rowCtx.textBaseline = "middle";
        rowCtx.font = (rz > 12 ? 12 : rz) + "px Verdana";

        for (var row = startRow; row < endRow; row++) {
            var value = heatmap.getRowValueSelected(row);
            rowCtx.fillText(value, 230 - textSpacing, ((row - startRow) * rz) + (rz / 2));

            if ($.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1) {
                rowCtx.fillStyle = "rgba(0,0,0,0.3)";
                rowCtx.fillRect(0, ((row - startRow) * rz), 230, rz);
                rowCtx.fillStyle = "black";
            }

            if (heatmap.search != null && value.toUpperCase().indexOf(heatmap.search.toUpperCase()) != -1) {
                rowCtx.fillStyle = "rgba(255,255,0,0.3)";
                rowCtx.fillRect(0, ((row - startRow) * rz), 230, rz);
                rowCtx.fillStyle = "black";
            }

        }

        /*******************************************************************
         * HEATMAP CELLS *
         ******************************************************************/

        var heatmapCell = $('<td>');
        tableRow.append(heatmapCell);

        var heatmapCanvas = $("<canvas width='" + heatmap.size.width + "' height='" + heatmap.size.height + "'></canvas>");
        heatmapCell.append(heatmapCanvas);

        // Paint heatmap
        var cellCtx = heatmapCanvas.get()[0].getContext('2d');
        for (var row = startRow; row < endRow; row++) {

            for (var col = startCol; col < endCol; col++) {

                // Iterate all values
                var value = heatmap.getCellValueSelected(row, col);

                if (value != null) {
                    var color = heatmap.cells.decorators[heatmap.cells.selectedValue].toColor(value);
                    cellCtx.fillStyle = color;
                    cellCtx.fillRect((col - startCol) * cz, (row - startRow) * rz, cz, rz);
                }
            }

            if ($.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1) {
                cellCtx.fillStyle = "rgba(0,0,0,0.2)";
                cellCtx.fillRect(0, (row - startRow) * rz, (endCol - startCol) * cz, rz);
                cellCtx.fillStyle = "white";
            }
        }

        // Paint selected columns
        for (var col = startCol; col < endCol; col++) {
            if ($.inArray(heatmap.cols.order[col], heatmap.cols.selected) > -1) {
                cellCtx.fillStyle = "rgba(0,0,0,0.2)";
                cellCtx.fillRect((col - startCol) * cz, 0, cz, (endRow - startRow) * rz);
                cellCtx.fillStyle = "white";
            }
        }
        ;

        var zoomHeatmap = function (zoomin, col, row) {
            if (zoomin) {
                heatmap.cols.zoom += 3;
                heatmap.rows.zoom += 3;

                var ncz = cz + 3;
                ncz = ncz < 3 ? 3 : ncz;
                ncz = ncz > 32 ? 32 : ncz;

                // Zoom rows
                var nrz = rz + 3;
                nrz = nrz < 3 ? 3 : nrz;
                nrz = nrz > 32 ? 32 : nrz;

                var ml = Math.round(col - heatmap.offset.left - ((cz * (col - heatmap.offset.left)) / ncz));
                var mt = Math.round(row - heatmap.offset.top - ((rz * (row - heatmap.offset.top)) / nrz));

                heatmap.offset.left += ml;
                heatmap.offset.top += mt;
            } else {
                heatmap.cols.zoom -= 3;
                heatmap.rows.zoom -= 3;

                var ncz = cz - 3;
                ncz = ncz < 3 ? 3 : ncz;
                ncz = ncz > 32 ? 32 : ncz;

                // Zoom rows
                var nrz = rz - 3;
                nrz = nrz < 3 ? 3 : nrz;
                nrz = nrz > 32 ? 32 : nrz;

                var ml = Math.round(col - heatmap.offset.left - ((cz * (col - heatmap.offset.left)) / ncz));
                var mt = Math.round(row - heatmap.offset.top - ((rz * (row - heatmap.offset.top)) / nrz));

                heatmap.offset.left += ml;
                heatmap.offset.top += mt;
            }

            if (!(nrz == rz && ncz == cz)) {
                heatmap.paint(obj);
            }
        };

        heatmapCanvas.bind('mousewheel', function (e, delta, deltaX, deltaY) {
            var pos = $(this).position();
            var col = Math.floor((e.pageX - pos.left) / cz) + heatmap.offset.left;
            var row = Math.floor((e.pageY - pos.top) / rz) + heatmap.offset.top;
            var zoomin = delta / 120 > 0;

            zoomHeatmap(zoomin, col, row);
        });

        heatmapCanvas.bind('gesturechange', function (e) {
            e.preventDefault();
        });

        heatmapCanvas.bind('gestureend', function (e) {
            e.preventDefault();

            var col = Math.round(startCol + ((endCol - startCol) / 2));
            var row = Math.round(startRow + ((endRow - startRow) / 2));
            var zoomin = e.originalEvent.scale > 1;

            console.log("zoomin=" + zoomin + " col=" + col + " row=" + row + " startRow=" + startRow + " endRow="
                + endRow);
            zoomHeatmap(zoomin, col, row);
        });

        var downX = null;
        var downY = null;

        heatmapCanvas.bind('vmousedown', function (e) {
            e.preventDefault();
            downX = e.pageX;
            downY = e.pageY;
        });

        heatmapCanvas.bind('vmouseup', function (e) {
            e.preventDefault();

            if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
                return;
            }

            var pX = e.pageX - downX;
            var pY = e.pageY - downY;

            var c = Math.round(pX / cz);
            var r = Math.round(pY / rz);

            heatmap.offset.top -= r;
            heatmap.offset.left -= c;

            if (!(r == 0 && c == 0)) {
                heatmap.paint(obj);
            }
        });

        // Show details box
        heatmapCanvas.bind('vclick', function (e) {

            var position = $(this).position();
            var col = Math.floor((e.originalEvent.pageX - position.left) / cz) + heatmap.offset.left;
            var row = Math.floor((e.originalEvent.pageY - position.top) / rz) + heatmap.offset.top;

            var cl = heatmap.cols.values.length;
            var pos = heatmap.rows.order[row] * cl + heatmap.cols.order[col];
            var value = heatmap.cells.values[pos];

            var details = $('table.heatmap div.detailsbox');

            var boxTop = e.originalEvent.pageY;
            var boxLeft = e.originalEvent.pageX;
            var boxWidth;
            var boxHeight;

            if (value == null) {
                details.html("<ul><li>No data</li></ul>");
                boxWidth = 120;
                boxHeight = 40;

            } else {
                var boxHtml = "<ul>";
                boxHtml += "<li><strong>Column:</strong> " + heatmap.getColValueSelected(col) + "</li>";
                boxHtml += "<li><strong>Row:</strong> " + heatmap.getRowValueSelected(row) + "</li>";
                for (var i = 0; i < heatmap.cells.header.length; i++) {
                    boxHtml += "<li>";
                    boxHtml += "<strong>" + heatmap.cells.header[i] + ":</strong> ";
                    boxHtml += value[i];
                    boxHtml += "</li>";
                }
                boxHtml += "</ul>";

                details.html(boxHtml);
                boxWidth = 300;
                boxHeight = 60 + (heatmap.cells.header.length * 20);
            }

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
            details.bind('vclick', function () {
                $(this).css('display', 'none');
            });

        });



        /*******************************************************************
         * Vertical annotations
         ******************************************************************/

        if (heatmap.rows.annotations.length > 0) {

            var rowsAnnCell = $("<td class='borderL'>");
            tableRow.append(rowsAnnCell);

            var rowsAnnCanvas = $("<canvas width='" + heatmap.rows.annotations.length * 10 + "' height='"
                + heatmap.size.height + "'></canvas>");
            rowsAnnCell.append(rowsAnnCanvas);

            // Paint heatmap
            var rowsAnnValuesCtx = rowsAnnCanvas.get()[0].getContext('2d');
            for (var row = startRow; row < endRow; row++) {

                for (var i = 0; i < heatmap.rows.annotations.length; i++) {
                    var field = heatmap.rows.annotations[i];
                    var value = heatmap.getRowValue(row, field);

                    if (value != null) {
                        rowsAnnValuesCtx.fillStyle = heatmap.rows.decorators[field].toColor(value);
                        rowsAnnValuesCtx.fillRect(i * 10, (row - startRow) * rz, 10, rz);
                    }

                }

                if ($.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1) {
                    rowsAnnValuesCtx.fillStyle = "rgba(0,0,0,0.2)";
                    rowsAnnValuesCtx.fillRect(0, (row - startRow) * rz, heatmap.rows.annotations.length * 10, rz);
                    rowsAnnValuesCtx.fillStyle = "white";
                }
            }

        }

        /*******************************************************************
         * Vertical scroll
         ******************************************************************/

        var scrollVert = $("<td class='borderL'>");
        tableRow.append(scrollVert);

        var maxHeight = (endRow - startRow) * rz;
        var scrollVertCanvas = $("<canvas title='Click to jump to this position' width='10' height='" + heatmap.size.height + "'></canvas>");
        scrollVert.append(scrollVertCanvas);

        var scrollVertCtx = scrollVertCanvas.get()[0].getContext('2d');

        scrollVertCtx.fillStyle = "rgba(0,0,0,0.4)";
        var iniY = Math.round(maxHeight * (startRow / heatmap.rows.order.length));
        var endY = Math.round(maxHeight * (endRow / heatmap.rows.order.length));
        scrollVertCtx.fillRect(0, iniY, 10, endY - iniY);

        scrollVertCanvas.click(function (e) {
            var pos = $(this).position();
            var pY = e.pageY - pos.top - ((endY - iniY) / 2);
            pY = (pY < 0 ? 0 : pY);
            heatmap.offset.top = Math.round((pY / maxHeight) * heatmap.rows.order.length);
            heatmap.paint(obj);
        });

        if (this.showScrollBarTooltip == true) {
            $(scrollVertCanvas).tooltip({
                delay: 0,
                top: 15,
                left: 0,
                fade: false,
                blocked: true
            });
        }

        // Right table border
        tableRow.append("<td class='borderL'>&nbsp;</td>");
        table.append(tableRow);

        /*******************************************************************
         * Horizontal scroll
         ******************************************************************/
        var scrollRow = $("<tr class='horizontalScroll'>");
        scrollRow.append("<td class='border'></td>");
        scrollRow.append("<td class='border'></td>");
        var scrollHor = $("<td class='borderT'>");
        scrollRow.append(scrollHor);
        scrollRow.append("<td class='border'></td>");

        if (heatmap.rows.annotations.length > 0) {
            scrollRow.append("<td class='border'></td>");
        }

        scrollRow.append("<td class='border'></td>");

        var maxWidth = (endCol - startCol) * cz;
        var scrollHorCanvas = $("<canvas title='Click to jump to this position' width='" + heatmap.size.width + "' height='10'></canvas>");
        scrollHor.append(scrollHorCanvas);

        var scrollHorCtx = scrollHorCanvas.get()[0].getContext('2d');

        scrollHorCtx.fillStyle = "rgba(0,0,0,0.4)";
        var iniX = Math.round(maxWidth * (startCol / heatmap.cols.order.length));
        var endX = Math.round(maxWidth * (endCol / heatmap.cols.order.length));
        scrollHorCtx.fillRect(iniX, 0, endX - iniX, 10);

        scrollHorCanvas.click(function (e) {
            var pos = $(this).position();
            var pX = e.pageX - pos.left - ((endX - iniX) / 2);
            pX = (pX < 0 ? 0 : pX);
            heatmap.offset.left = Math.round((pX / maxWidth) * heatmap.cols.order.length);
            heatmap.paint(obj);
        });

        if (this.showScrollBarTooltip == true) {
            $(scrollHorCanvas).tooltip({
                delay: 0,
                top: -40,
                left: 0,
                fade: false,
                blocked: true
            });
        }

        table.append(scrollRow);

        /*******************************************************************
         * Close table
         ******************************************************************/

            // Last border row
        var lastRow = $('<tr>');
        lastRow.append($("<td class='border'>").append($('<img>', {
        'src':basePath + "/images/sep.png"
        })));
        lastRow.append("<td class='border'></td>");
        lastRow.append("<td class='borderT'></td>");
        if (heatmap.rows.annotations.length > 0) {
            lastRow.append("<td class='border'></td>");
        }
        lastRow.append("<td class='border'></td>");
        lastRow.append("<td class='border'></td>");
        table.append(lastRow);
        obj.append(table);
        $('div.heatmap-loader').hide();

    };

};
