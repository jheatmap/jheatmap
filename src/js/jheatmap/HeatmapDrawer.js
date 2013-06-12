/**
 *
 * Heatmap drawer.
 *
 * @author Jordi Deu-Pons
 * @class
 */
jheatmap.HeatmapDrawer = function (heatmap) {

    // Components
    var canvasCols = null;
    var canvasRows = null;
    var canvasCells = null;
    var canvasAnnRowHeader = null;
    var canvasAnnColHeader = null;
    var canvasAnnRows = null;
    var canvasAnnCols = null;
    var canvasHScroll = null;
    var canvasVScroll = null;

    var lastPaint = null;

    /**
     * Show loading image while running 'runme'
     *
     * @param runme Function to execute
     */
    var loading = function (runme) {
        $('#heatmap-loader').show();
        var interval = window.setInterval(function () {
            runme.call(this);
            $('#heatmap-loader').hide();
            window.clearInterval(interval);
        }, 1);
    };

    /**
     * Paint the heatmap.
     */
    this.paint = function () {

        var currentPaint = new Date().getTime();
        if (lastPaint != null && (currentPaint - lastPaint) < 100) {
            return;
        }
        lastPaint = currentPaint;

        // Minimum zooms
        var mcz = Math.max(3, Math.round(heatmap.size.width / heatmap.cols.order.length));
        var mrz = Math.max(3, Math.round(heatmap.size.height / heatmap.rows.order.length));

        // Zoom columns
        var cz = heatmap.cols.zoom;
        cz = cz < mcz ? mcz : cz;
        cz = cz > 32 ? 32 : cz;
        heatmap.cols.zoom = cz;

        // Zoom rows
        var rz = heatmap.rows.zoom;
        rz = rz < mrz ? mrz : rz;
        rz = rz > 32 ? 32 : rz;
        heatmap.rows.zoom = rz;

        var maxCols = Math.min(heatmap.cols.order.length, Math.round(heatmap.size.width / cz) + 1);
        var maxRows = Math.min(heatmap.rows.order.length, Math.round(heatmap.size.height / rz) + 1);

        var top = heatmap.offset.top;
        if (top < 0) {
            top = 0;
        }
        if (top > (heatmap.rows.order.length - maxRows + 1)) {
            top = (heatmap.rows.order.length - maxRows + 1);
        }
        heatmap.offset.top = top;

        var left = heatmap.offset.left;
        if (left < 0) {
            left = 0;
        }
        if (left > (heatmap.cols.order.length - maxCols + 1)) {
            left = (heatmap.cols.order.length - maxCols + 1);
        }
        heatmap.offset.left = left;

        heatmap.startRow = heatmap.offset.top;
        heatmap.endRow = Math.min(heatmap.offset.top + maxRows, heatmap.rows.order.length);

        heatmap.startCol = heatmap.offset.left;
        heatmap.endCol = Math.min(heatmap.offset.left + maxCols, heatmap.cols.order.length);

        // Column headers
        var colCtx = canvasCols.get()[0].getContext('2d');
        colCtx.clearRect(0, 0, colCtx.canvas.width, colCtx.canvas.height);

        colCtx.fillStyle = "black";
        colCtx.textAlign = "right";
        colCtx.textBaseline = "middle";
        colCtx.font = (cz > 12 ? 12 : cz) + "px Helvetica Neue,Helvetica,Arial,sans-serif";

        for (var c = heatmap.startCol; c < heatmap.endCol; c++) {
            var value = heatmap.getColValueSelected(c);
            colCtx.save();
            colCtx.translate((c - heatmap.startCol) * cz + (cz / 2), 145);
            colCtx.rotate(Math.PI / 2);
            colCtx.fillText(value, -heatmap.textSpacing, 0);
            colCtx.restore();

            // Order mark
            colCtx.save();
            colCtx.translate(Math.round(((c - heatmap.startCol) * cz) + (cz / 2)), 146)
            colCtx.rotate(Math.PI / 4);
            if ((heatmap.rows.sort.field == heatmap.cells.selectedValue) &&
                ((heatmap.rows.sort.type == "single" && heatmap.rows.sort.item == heatmap.cols.order[c]) ||
                    (heatmap.rows.sort.type == "value" && $.inArray(heatmap.cols.order[c], heatmap.rows.sort.item) > -1))) {
                jheatmap.utils.drawOrderSymbol(colCtx, heatmap.rows.sort.asc);
            } else {
                if (heatmap.cols.zoom < 6) {
                    colCtx.fillRect(-1, -1, 2, 2);
                } else {
                    colCtx.fillRect(-2, -2, 4, 4);
                }
            }
            colCtx.fillStyle = "black";
            colCtx.restore();

            if ($.inArray(heatmap.cols.order[c], heatmap.cols.selected) > -1) {
                colCtx.fillStyle = "rgba(0,0,0,0.1)";
                colCtx.fillRect((c - heatmap.startCol) * cz, 0, cz, 150);
                colCtx.fillStyle = "black";
            }

            if (heatmap.search != null && value.toUpperCase().indexOf(heatmap.search.toUpperCase()) != -1) {
                colCtx.fillStyle = "rgba(255,255,0,0.3)";
                colCtx.fillRect((c - heatmap.startCol) * cz, 0, cz, 150);
                colCtx.fillStyle = "black";
            }
        }

        // Rows headers
        var rowCtx = canvasRows.get()[0].getContext('2d');
        rowCtx.clearRect(0, 0, colCtx.canvas.width, rowCtx.canvas.height);
        rowCtx.fillStyle = "black";
        rowCtx.textAlign = "right";
        rowCtx.textBaseline = "middle";
        rowCtx.font = (rz > 12 ? 12 : rz) + "px Helvetica Neue,Helvetica,Arial,sans-serif";

        for (var row = heatmap.startRow; row < heatmap.endRow; row++) {
            var value = heatmap.getRowValueSelected(row);
            rowCtx.fillText(value, 225 - heatmap.textSpacing, ((row - heatmap.startRow) * rz) + (rz / 2));

            // Order mark
            rowCtx.save();
            rowCtx.translate(226, ((row - heatmap.startRow) * rz) + (rz / 2));
            rowCtx.rotate(-Math.PI / 4);
            if ((heatmap.cols.sort.field == heatmap.cells.selectedValue) &&
                ((heatmap.cols.sort.type == "single" && heatmap.cols.sort.item == heatmap.rows.order[row]) ||
                    (heatmap.cols.sort.type == "value" && $.inArray(heatmap.rows.order[row], heatmap.cols.sort.item) > -1))) {
                jheatmap.utils.drawOrderSymbol(rowCtx, heatmap.cols.sort.asc);
            } else {
                if (heatmap.rows.zoom < 6) {
                    rowCtx.fillRect(-1, -1, 2, 2);
                } else {
                    rowCtx.fillRect(-2, -2, 4, 4);
                }
            }
            rowCtx.fillStyle = "black";
            rowCtx.restore();


            if ($.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1) {
                rowCtx.fillStyle = "rgba(0,0,0,0.1)";
                rowCtx.fillRect(0, ((row - heatmap.startRow) * rz), 230, rz);
                rowCtx.fillStyle = "black";
            }

            if (heatmap.search != null && value.toUpperCase().indexOf(heatmap.search.toUpperCase()) != -1) {
                rowCtx.fillStyle = "rgba(255,255,0,0.3)";
                rowCtx.fillRect(0, ((row - heatmap.startRow) * rz), 230, rz);
                rowCtx.fillStyle = "black";
            }
        }

        // Row annotations
        if (heatmap.rows.annotations.length > 0) {

            var annRowHeadCtx = canvasAnnRowHeader.get()[0].getContext('2d');
            annRowHeadCtx.clearRect(0, 0, annRowHeadCtx.canvas.width, annRowHeadCtx.canvas.height);
            annRowHeadCtx.fillStyle = "rgb(51,51,51)";
            annRowHeadCtx.textAlign = "right";
            annRowHeadCtx.textBaseline = "middle";
            annRowHeadCtx.font = "bold 11px Helvetica Neue,Helvetica,Arial,sans-serif";

            for (var i = 0; i < heatmap.rows.annotations.length; i++) {

                var value = heatmap.rows.header[heatmap.rows.annotations[i]];
                annRowHeadCtx.save();
                annRowHeadCtx.translate(i * 10 + 5, 150);
                annRowHeadCtx.rotate(Math.PI / 2);
                annRowHeadCtx.fillText(value, -heatmap.textSpacing, 0);
                annRowHeadCtx.restore();
            }

            var rowsAnnValuesCtx = canvasAnnRows.get()[0].getContext('2d');
            rowsAnnValuesCtx.clearRect(0, 0, rowsAnnValuesCtx.canvas.width, rowsAnnValuesCtx.canvas.height);
            for (var row = heatmap.startRow; row < heatmap.endRow; row++) {

                for (var i = 0; i < heatmap.rows.annotations.length; i++) {
                    var field = heatmap.rows.annotations[i];
                    var value = heatmap.getRowValue(row, field);

                    if (value != null) {
                        rowsAnnValuesCtx.fillStyle = heatmap.rows.decorators[field].toColor(value);
                        rowsAnnValuesCtx.fillRect(i * 10, (row - heatmap.startRow) * rz, 10, rz);
                    }

                }

                if ($.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1) {
                    rowsAnnValuesCtx.fillStyle = "rgba(0,0,0,0.1)";
                    rowsAnnValuesCtx.fillRect(0, (row - heatmap.startRow) * rz, heatmap.rows.annotations.length * 10, rz);
                    rowsAnnValuesCtx.fillStyle = "white";
                }
            }
        }

        // Columns annotations
        if (heatmap.cols.annotations.length > 0) {

            var colAnnHeaderCtx = canvasAnnColHeader.get()[0].getContext('2d');
            colAnnHeaderCtx.clearRect(0, 0, colAnnHeaderCtx.canvas.width, colAnnHeaderCtx.canvas.height);
            colAnnHeaderCtx.fillStyle = "rgb(51,51,51)";
            colAnnHeaderCtx.textAlign = "right";
            colAnnHeaderCtx.textBaseline = "middle";
            colAnnHeaderCtx.font = "bold 11px Helvetica Neue,Helvetica,Arial,sans-serif";

            for (i = 0; i < heatmap.cols.annotations.length; i++) {
                var value = heatmap.cols.header[heatmap.cols.annotations[i]];
                colAnnHeaderCtx.fillText(value, 200 - heatmap.textSpacing, (i * 10) + 5);
            }

            var colAnnValuesCtx = canvasAnnCols.get()[0].getContext('2d');
            colAnnValuesCtx.clearRect(0, 0, colAnnValuesCtx.canvas.width, colAnnValuesCtx.canvas.height);
            for (i = 0; i < heatmap.cols.annotations.length; i++) {
                for (var col = heatmap.startCol; col < heatmap.endCol; col++) {

                    var field = heatmap.cols.annotations[i];
                    value = heatmap.getColValue(col, field);

                    if (value != null) {
                        var color = heatmap.cols.decorators[field].toColor(value);
                        colAnnValuesCtx.fillStyle = color;
                        colAnnValuesCtx.fillRect((col - heatmap.startCol) * cz, i * 10, cz, 10);
                    }
                }
            }

            for (var col = heatmap.startCol; col < heatmap.endCol; col++) {
                if ($.inArray(heatmap.cols.order[col], heatmap.cols.selected) > -1) {
                    colAnnValuesCtx.fillStyle = "rgba(0,0,0,0.1)";
                    colAnnValuesCtx.fillRect((col - heatmap.startCol) * cz, 0, cz, heatmap.cols.annotations.length * 10);
                    colAnnValuesCtx.fillStyle = "white";
                }
            }
        }

        // Cells
        var cellCtx = canvasCells.get()[0].getContext('2d');
        cellCtx.clearRect(0, 0, cellCtx.canvas.width, cellCtx.canvas.height)
        for (var row = heatmap.startRow; row < heatmap.endRow; row++) {

            for (var col = heatmap.startCol; col < heatmap.endCol; col++) {

                // Iterate all values
                var value = heatmap.getCellValueSelected(row, col);

                if (value != null) {
                    var color = heatmap.cells.decorators[heatmap.cells.selectedValue].toColor(value);
                    cellCtx.fillStyle = color;
                    cellCtx.fillRect((col - heatmap.startCol) * cz, (row - heatmap.startRow) * rz, cz, rz);
                }
            }

            if ($.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1) {
                cellCtx.fillStyle = "rgba(0,0,0,0.1)";
                cellCtx.fillRect(0, (row - heatmap.startRow) * rz, (heatmap.endCol - heatmap.startCol) * cz, rz);
                cellCtx.fillStyle = "white";
            }
        }

        // Selected columns
        for (var col = heatmap.startCol; col < heatmap.endCol; col++) {
            if ($.inArray(heatmap.cols.order[col], heatmap.cols.selected) > -1) {
                cellCtx.fillStyle = "rgba(0,0,0,0.1)";
                cellCtx.fillRect((col - heatmap.startCol) * cz, 0, cz, (heatmap.endRow - heatmap.startRow) * rz);
                cellCtx.fillStyle = "white";
            }
        }

        // Vertical scroll
        var maxHeight = (heatmap.endRow - heatmap.startRow) * heatmap.rows.zoom;
        var iniY = Math.round(maxHeight * (heatmap.startRow / heatmap.rows.order.length));
        var endY = Math.round(maxHeight * (heatmap.endRow / heatmap.rows.order.length));
        var scrollVertCtx = canvasVScroll.get()[0].getContext('2d');
        scrollVertCtx.clearRect(0, 0, scrollVertCtx.canvas.width, scrollVertCtx.canvas.height)
        scrollVertCtx.fillStyle = "rgba(0,136,204,1)";
        scrollVertCtx.fillRect(0, iniY, 10, endY - iniY);

        // Horizontal scroll
        var scrollHorCtx = canvasHScroll.get()[0].getContext('2d');
        scrollHorCtx.clearRect(0, 0, scrollHorCtx.canvas.width, scrollHorCtx.canvas.height)
        scrollHorCtx.fillStyle = "rgba(0,136,204,1)";
        var maxWidth = (heatmap.endCol - heatmap.startCol) * heatmap.cols.zoom;
        var iniX = Math.round(maxWidth * (heatmap.startCol / heatmap.cols.order.length));
        var endX = Math.round(maxWidth * (heatmap.endCol / heatmap.cols.order.length));
        scrollHorCtx.fillRect(iniX, 0, endX - iniX, 10);

        lastPaint = new Date().getTime();

    };

    /**
     * Build the heatmap.
     */
    this.build = function () {

        var obj = heatmap.divHeatmap;

        // Loader
        obj.html('');

        var table = $("<table>", {
            "class": "heatmap"
        });

        var firstRow = $("<tr>");
        table.append(firstRow);

        /*
         * TOP-LEFT PANEL
         */

        var topleftPanel = $("<th>", {
            "class": "topleft"
        });
        firstRow.append(topleftPanel);
        topleftPanel.append('<td><div class="detailsbox">cell details here</div></td>');

        topleftPanel.append("<td class='border' style='font-size: 11px; vertical-align: right; padding-left: 70px; padding-bottom: 4px;'>" +
            "<div><a href='#helpModal' data-toggle='modal'>Keyboard shortcuts</a></div>" +
            "<div class='modal hide' id='helpModal' tabindex='-1' role='dialog'>" +
            "<div class='modal-header'><button type='button' class='close' data-dismiss='modal'>&times;</button>" +
            "<h3>Keyboard shortcuts</h3></div>" +
            "<div class='modal-body'>" +
            "<dl class='dl-horizontal'>" +
            "<dd><strong>Place the mouse over rows or columns and press the key:</strong></dd>" +
            "<dt>H</dt><dd>Hide selected rows/columns</dd>" +
            "<dt>S</dt><dd>Show hidden rows/columns</dd>" +
            "<dt>R</dt><dd>Remove selection from rows/columns</dd>" +
            "</dl>" +
            "</div>" +
            "<div class='modal-footer'>" +
            "<button class='btn' data-dismiss='modal'>Close</button>" +
            "</div>" +
            "</div>" +
            "</td>");

        // Add filters
        for (var filterId in heatmap.filters) {

            var filterDef = heatmap.filters[filterId];

            if ($.inArray(heatmap.cells.selectedValue, filterDef.fields) > -1) {

                var checkInput = $('<input type="checkbox">');
                checkInput.prop('checked', heatmap.getRowsFilter(filterId));
                checkInput.click(function () {
                    var checkbox = $(this);
                    loading(function () {
                        if (checkbox.is(':checked')) {
                            heatmap.addRowsFilter(filterId);
                        } else {
                            heatmap.removeRowsFilter(filterId);
                        }
                        heatmap.applyRowsFilters();
                        heatmap.paint();
                    });
                });

                topleftPanel.append($('<div>', {
                    'class': 'filter'
                }).append(checkInput).append($('<span>').html(filterDef.title)));

            }
        }

        // Add column selector
        var selectCol = $("<select>").change(function () {
            heatmap.cols.selectedValue = $(this)[0].value;
            loading(function () {
                heatmap.paint();
            });
        });
        topleftPanel.append($("<span>Columns</span>"));
        topleftPanel.append(selectCol);
        for (var o = 0; o < heatmap.cols.header.length; o++) {
            selectCol.append(new Option(heatmap.cols.header[o], o, o == heatmap.cols.selectedValue));
        }
        selectCol.val(heatmap.cols.selectedValue);
        topleftPanel.append($("<br>"));

        // Add row selector
        var selectRow = $("<select>").change(function () {
            heatmap.rows.selectedValue = $(this)[0].value;
            loading(function () {
                heatmap.paint();
            });
        });
        topleftPanel.append($("<span>Rows</span>"));
        topleftPanel.append(selectRow);
        topleftPanel.append($("<br>"));

        for (o = 0; o < heatmap.rows.header.length; o++) {
            selectRow.append(new Option(heatmap.rows.header[o], o, o == heatmap.rows.selectedValue));
        }
        selectRow.val(heatmap.rows.selectedValue);

        // Add cell selector
        var selectCell = $("<select>").change(function () {
            heatmap.cells.selectedValue = $(this)[0].value;
            loading(function () {
                heatmap.paint();
            });
        });
        topleftPanel.append($("<span>Cells</span>"));
        topleftPanel.append(selectCell);
        topleftPanel.append($("<br>"));

        for (o = 0; o < heatmap.cells.header.length; o++) {
            if (heatmap.cells.header[o] == undefined) {
                continue;
            }
            selectCell.append(new Option(heatmap.cells.header[o], o, o == heatmap.cells.selectedValue));
        }
        selectCell.val(heatmap.cells.selectedValue);

        /*******************************************************************
         * COLUMN HEADERS *
         ******************************************************************/

        // Add column headers
        var colHeader = $("<th>");
        firstRow.append(colHeader);

        canvasCols = $("<canvas class='header' id='colCanvas' width='" + heatmap.size.width + "' height='150' tabindex='3'></canvas>");
        canvasCols.bind('mousedown', function (e) {
            heatmap.onColsMouseDown(e);
        });
        canvasCols.bind('mousemove', function (e) {
            heatmap.onColsMouseMove(e);
        });
        canvasCols.bind('mouseup', function (e) {
            heatmap.onColsMouseUp(e);
        });
        canvasCols.bind('mouseover', heatmap.handleFocus);
        canvasCols.bind('mouseout', heatmap.handleFocus);
        canvasCols.bind('keypress', function (e) {
            heatmap.onColsKeyPress(e);
        });
        colHeader.append(canvasCols);

        /*******************************************************************
         * ADD ROW HEADER ANNOTATIONS
         ******************************************************************/

        var rowspan = (heatmap.cols.annotations.length > 0 ? 2 : 1);

        if (heatmap.rows.annotations.length > 0) {

            var annRowHead = $("<th>", {
                'class': 'border-rows-ann',
                'rowspan': rowspan
            });
            firstRow.append(annRowHead);

            canvasAnnRowHeader = $("<canvas class='header' width='" + 10 * heatmap.rows.annotations.length
                + "' height='150'></canvas>");
            annRowHead.append(canvasAnnRowHeader);

            canvasAnnRowHeader.click(function (e) {
                var pos = $(e.target).offset();
                var i = Math.floor((e.pageX - pos.left) / 10);

                heatmap.sortRowsByLabel(heatmap.rows.annotations[i], !heatmap.rows.sort.asc);
                heatmap.paint();

            });

        }

        firstRow.append($("<th>", {
            'class': 'border',
            'rowspan': rowspan
        }));

        firstRow.append($("<th>", {
            'class': 'border',
            'rowspan': rowspan
        }));


        /*******************************************************************
         * ADD COLUMN ANNOTATIONS
         ******************************************************************/

        if (heatmap.cols.annotations.length > 0) {

            firstRow = $("<tr class='annotations'>");
            table.append(firstRow);

            var colAnnHeaderCell = $("<th>", {
                "class": "border-cols-ann"
            });
            canvasAnnColHeader = $("<canvas class='header' style='float:right;' width='200' height='" + 10
                * heatmap.cols.annotations.length + "'></canvas>");
            colAnnHeaderCell.append(canvasAnnColHeader);
            firstRow.append(colAnnHeaderCell);

            var colAnnValuesCell = $("<th>");
            canvasAnnCols = $("<canvas width='" + heatmap.size.width + "' height='" + 10
                * heatmap.cols.annotations.length + "'></canvas>");
            colAnnValuesCell.append(canvasAnnCols);
            firstRow.append(colAnnValuesCell);

            canvasAnnColHeader.click(function (e) {
                var pos = $(e.target).offset();
                var i = Math.floor((e.pageY - pos.top) / 10);
                heatmap.sortColsByLabel(heatmap.cols.annotations[i], !heatmap.cols.sort.asc);
                heatmap.paint();
            });
        }

        // Add left border
        var tableRow = $('<tr>');

        /*******************************************************************
         * ROWS HEADERS *
         ******************************************************************/
        var rowsCell = $("<td>", {
            "class": "row"
        });
        canvasRows = $("<canvas class='header' width='230' height='" + heatmap.size.height + "' tabindex='1'></canvas>");
        canvasRows.bind('mousedown', function (e) {
            heatmap.onRowsMouseDown(e);
        });
        canvasRows.bind('mousemove', function (e) {
            heatmap.onRowsMouseMove(e);
        });
        canvasRows.bind('mouseup', function (e) {
            heatmap.onRowsMouseUp(e);
        });
        canvasRows.bind('mouseover', heatmap.handleFocus);
        canvasRows.bind('mouseout', heatmap.handleFocus);
        canvasRows.bind('keypress', function (e) {
            heatmap.onRowsKeyPress(e);
        });

        rowsCell.append(canvasRows);
        tableRow.append(rowsCell);

        /*******************************************************************
         * HEATMAP CELLS *
         ******************************************************************/
        var heatmapCell = $('<td>');
        tableRow.append(heatmapCell);
        canvasCells = $("<canvas width='" + heatmap.size.width + "' height='" + heatmap.size.height + "' tabindex='2'></canvas>");
        canvasCells.bind('mousewheel', function (e, delta, deltaX, deltaY) {
            heatmap.onCellsMouseWheel(e, delta, deltaX, deltaY);
        });
        canvasCells.bind('gesturechange', function (e) {
            heatmap.onCellsGestureChange(e);
        });
        canvasCells.bind('gestureend', function (e) {
            heatmap.onCellsGestureEnd(e);
        });
        canvasCells.bind('mousedown', function (e) {
            heatmap.onCellsMouseDown(e);
        });
        canvasCells.bind('mousemove', function (e) {
            heatmap.onCellsMouseMove(e);
        });
        canvasCells.bind('mouseup', function (e) {
            heatmap.onCellsMouseUp(e);
        });
        heatmapCell.append(canvasCells);

        /*******************************************************************
         * Vertical annotations
         ******************************************************************/
        if (heatmap.rows.annotations.length > 0) {
            var rowsAnnCell = $("<td class='borderL'>");
            tableRow.append(rowsAnnCell);
            canvasAnnRows = $("<canvas width='" + heatmap.rows.annotations.length * 10 + "' height='" + heatmap.size.height + "'></canvas>");
            rowsAnnCell.append(canvasAnnRows);
        }

        /*******************************************************************
         * Vertical scroll
         ******************************************************************/
        var scrollVert = $("<td class='borderL'>");
        tableRow.append(scrollVert);
        canvasVScroll = $("<canvas class='header' width='10' height='" + heatmap.size.height + "'></canvas>");
        scrollVert.append(canvasVScroll);
        canvasVScroll.bind('click', function (e) {
            heatmap.onVScrollClick(e);
        });
        canvasVScroll.bind('mousedown', function (e) {
            heatmap.onVScrollMouseDown(e);
        });
        canvasVScroll.bind('mouseup', function (e) {
            heatmap.onVScrollMouseUp(e);
        });
        canvasVScroll.bind('mousemove', function (e) {
            heatmap.onVScrollMouseMove(e);
        });

        // Right table border
        tableRow.append("<td class='borderL'>&nbsp;</td>");
        table.append(tableRow);

        /*******************************************************************
         * Horizontal scroll
         ******************************************************************/
        var scrollRow = $("<tr class='horizontalScroll'>");
        scrollRow.append("<td class='border' style='font-size: 11px; vertical-align: right; padding-left: 10px; padding-top: 7px;'>" +
            "<span>visualized with <a href='http://bg.upf.edu/jheatmap/' target='_blank'>jHeatmap</a></span>" +
            "</td>");

        var scrollHor = $("<td class='borderT'>");
        scrollRow.append(scrollHor);
        scrollRow.append("<td class='border'></td>");

        if (heatmap.rows.annotations.length > 0) {
            scrollRow.append("<td class='border'></td>");
        }

        scrollRow.append("<td class='border'></td>");

        canvasHScroll = $("<canvas class='header' width='" + heatmap.size.width + "' height='10'></canvas>");
        scrollHor.append(canvasHScroll);

        canvasHScroll.bind('click', function (e) {
            heatmap.onHScrollClick(e);
        });
        canvasHScroll.bind('mousedown', function (e) {
            heatmap.onHScrollMouseDown(e);
        });
        canvasHScroll.bind('mouseup', function (e) {
            heatmap.onHScrollMouseUp(e);
        });
        canvasHScroll.bind('mousemove', function (e) {
            heatmap.onHScrollMouseMove(e);
        });

        table.append(scrollRow);

        /*******************************************************************
         * Close table
         ******************************************************************/

        // Last border row
        var lastRow = $('<tr>');
        lastRow.append($("<td class='border'>").append($('<span>&nbsp;</span>')));
        lastRow.append("<td class='borderT'></td>");
        if (heatmap.rows.annotations.length > 0) {
            lastRow.append("<td class='border'></td>");
        }
        lastRow.append("<td class='border'></td>");
        lastRow.append("<td class='border'></td>");
        table.append(lastRow);
        obj.append(table);
        $('#heatmap-loader').hide();
        $('#helpModal').modal({ show: false });

    };
};