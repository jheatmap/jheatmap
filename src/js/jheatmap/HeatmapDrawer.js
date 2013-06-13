/**
 *
 * Heatmap drawer.
 *
 * @author Jordi Deu-Pons
 * @class
 */
jheatmap.HeatmapDrawer = function (heatmap) {

    var drawer = this;
    var container = heatmap.options.container;

    // Components
    var canvasRows = null;
    var canvasCells = null;
    var canvasAnnRowHeader = null;
    var canvasAnnColHeader = null;
    var canvasAnnRows = null;
    var canvasAnnCols = null;
    var canvasHScroll = null;
    var canvasVScroll = null;
    var lastPaint = null;

    var textSpacing = 5;

    // Components
    var controlsPanel = new jheatmap.components.ControlsPanel(drawer, heatmap);
    var columnsHeaderPanel = new jheatmap.components.ColumnsHeaderPanel(drawer, heatmap);

    /**
     * Build the heatmap.
     */
    this.build = function () {

        // Reset
        container.html('');

        var table = $("<table>", {
            "class": "heatmap"
        });

        var firstRow = $("<tr>");
        table.append(firstRow);
        firstRow.append(controlsPanel.markup);
        firstRow.append(columnsHeaderPanel.markup);

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

                heatmap.rows.sorter = new jheatmap.sorters.AnnotationSorter(heatmap.rows.annotations[i], !(heatmap.rows.sorter.asc));
                heatmap.rows.sorter.sort(heatmap, "rows");
                drawer.paint();

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
                heatmap.cols.sorter = new jheatmap.sorters.AnnotationSorter(heatmap.cols.annotations[i], !(heatmap.cols.sorter.asc));
                heatmap.cols.sorter.sort(heatmap, "columns");
                drawer.paint();
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
            drawer.onRowsMouseDown(e);
        });
        canvasRows.bind('mousemove', function (e) {
            drawer.onRowsMouseMove(e);
        });
        canvasRows.bind('mouseup', function (e) {
            drawer.onRowsMouseUp(e);
        });
        canvasRows.bind('mouseover', heatmap.handleFocus);
        canvasRows.bind('mouseout', heatmap.handleFocus);
        canvasRows.bind('keypress', function (e) {
            drawer.onRowsKeyPress(e);
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
            drawer.onCellsMouseWheel(e, delta, deltaX, deltaY);
        });
        canvasCells.bind('gesturechange', function (e) {
            drawer.onCellsGestureChange(e);
        });
        canvasCells.bind('gestureend', function (e) {
            drawer.onCellsGestureEnd(e);
        });
        canvasCells.bind('mousedown', function (e) {
            drawer.onCellsMouseDown(e);
        });
        canvasCells.bind('mousemove', function (e) {
            drawer.onCellsMouseMove(e);
        });
        canvasCells.bind('mouseup', function (e) {
            drawer.onCellsMouseUp(e);
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
            drawer.onVScrollClick(e);
        });
        canvasVScroll.bind('mousedown', function (e) {
            drawer.onVScrollMouseDown(e);
        });
        canvasVScroll.bind('mouseup', function (e) {
            drawer.onVScrollMouseUp(e);
        });
        canvasVScroll.bind('mousemove', function (e) {
            drawer.onVScrollMouseMove(e);
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
            drawer.onHScrollClick(e);
        });
        canvasHScroll.bind('mousedown', function (e) {
            drawer.onHScrollMouseDown(e);
        });
        canvasHScroll.bind('mouseup', function (e) {
            drawer.onHScrollMouseUp(e);
        });
        canvasHScroll.bind('mousemove', function (e) {
            drawer.onHScrollMouseMove(e);
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
        container.append(table);
        $('#heatmap-loader').hide();
        $('#helpModal').modal({ show: false });

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

        this.startRow = heatmap.offset.top;
        this.endRow = Math.min(heatmap.offset.top + maxRows, heatmap.rows.order.length);
        heatmap.offset.bottom = this.endRow;

        this.startCol = heatmap.offset.left;
        this.endCol = Math.min(heatmap.offset.left + maxCols, heatmap.cols.order.length);
        heatmap.offset.right = this.endCol;

        // Column headers panel
        columnsHeaderPanel.paint();

        // Rows headers
        var rowCtx = canvasRows.get()[0].getContext('2d');
        rowCtx.clearRect(0, 0, heatmap.size.width, rowCtx.canvas.height);
        rowCtx.fillStyle = "black";
        rowCtx.textAlign = "right";
        rowCtx.textBaseline = "middle";
        rowCtx.font = (rz > 12 ? 12 : rz) + "px Helvetica Neue,Helvetica,Arial,sans-serif";

        for (var row = this.startRow; row < this.endRow; row++) {
            var value = heatmap.rows.getValue(row, heatmap.rows.selectedValue);
            rowCtx.fillText(value, 225 - textSpacing, ((row - this.startRow) * rz) + (rz / 2));

            // Order mark
            rowCtx.save();
            rowCtx.translate(226, ((row - this.startRow) * rz) + (rz / 2));
            rowCtx.rotate(-Math.PI / 4);
            if (    (heatmap.cols.sorter.field == heatmap.cells.selectedValue) &&
                    ($.inArray(heatmap.rows.order[row], heatmap.cols.sorter.indices) > -1)
                ) {
                jheatmap.components.OrderSymbol(rowCtx, heatmap.cols.sorter.asc);
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
                rowCtx.fillRect(0, ((row - this.startRow) * rz), 230, rz);
                rowCtx.fillStyle = "black";
            }

            if (heatmap.search != null && value.toUpperCase().indexOf(heatmap.search.toUpperCase()) != -1) {
                rowCtx.fillStyle = "rgba(255,255,0,0.3)";
                rowCtx.fillRect(0, ((row - this.startRow) * rz), 230, rz);
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
                annRowHeadCtx.fillText(value, -textSpacing, 0);
                annRowHeadCtx.restore();
            }

            var rowsAnnValuesCtx = canvasAnnRows.get()[0].getContext('2d');
            rowsAnnValuesCtx.clearRect(0, 0, rowsAnnValuesCtx.canvas.width, rowsAnnValuesCtx.canvas.height);
            for (var row = this.startRow; row < this.endRow; row++) {

                for (var i = 0; i < heatmap.rows.annotations.length; i++) {
                    var field = heatmap.rows.annotations[i];
                    var value = heatmap.rows.getValue(row, field);

                    if (value != null) {
                        rowsAnnValuesCtx.fillStyle = heatmap.rows.decorators[field].toColor(value);
                        rowsAnnValuesCtx.fillRect(i * 10, (row - this.startRow) * rz, 10, rz);
                    }

                }

                if ($.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1) {
                    rowsAnnValuesCtx.fillStyle = "rgba(0,0,0,0.1)";
                    rowsAnnValuesCtx.fillRect(0, (row - this.startRow) * rz, heatmap.rows.annotations.length * 10, rz);
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
                colAnnHeaderCtx.fillText(value, 200 - textSpacing, (i * 10) + 5);
            }

            var colAnnValuesCtx = canvasAnnCols.get()[0].getContext('2d');
            colAnnValuesCtx.clearRect(0, 0, colAnnValuesCtx.canvas.width, colAnnValuesCtx.canvas.height);
            for (i = 0; i < heatmap.cols.annotations.length; i++) {
                for (var col = this.startCol; col < this.endCol; col++) {

                    var field = heatmap.cols.annotations[i];
                    value = heatmap.cols.getValue(col, field);

                    if (value != null) {
                        var color = heatmap.cols.decorators[field].toColor(value);
                        colAnnValuesCtx.fillStyle = color;
                        colAnnValuesCtx.fillRect((col - this.startCol) * cz, i * 10, cz, 10);
                    }
                }
            }

            for (var col = this.startCol; col < this.endCol; col++) {
                if ($.inArray(heatmap.cols.order[col], heatmap.cols.selected) > -1) {
                    colAnnValuesCtx.fillStyle = "rgba(0,0,0,0.1)";
                    colAnnValuesCtx.fillRect((col - this.startCol) * cz, 0, cz, heatmap.cols.annotations.length * 10);
                    colAnnValuesCtx.fillStyle = "white";
                }
            }
        }

        // Cells
        var cellCtx = canvasCells.get()[0].getContext('2d');
        cellCtx.clearRect(0, 0, cellCtx.canvas.width, cellCtx.canvas.height)
        for (var row = this.startRow; row < this.endRow; row++) {

            for (var col = this.startCol; col < this.endCol; col++) {

                // Iterate all values
                var value = heatmap.cells.getValue(row, col, heatmap.cells.selectedValue);

                if (value != null) {
                    var color = heatmap.cells.decorators[heatmap.cells.selectedValue].toColor(value);
                    cellCtx.fillStyle = color;
                    cellCtx.fillRect((col - this.startCol) * cz, (row - this.startRow) * rz, cz, rz);
                }
            }

            if ($.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1) {
                cellCtx.fillStyle = "rgba(0,0,0,0.1)";
                cellCtx.fillRect(0, (row - this.startRow) * rz, (this.endCol - this.startCol) * cz, rz);
                cellCtx.fillStyle = "white";
            }
        }

        // Selected columns
        for (var col = this.startCol; col < this.endCol; col++) {
            if ($.inArray(heatmap.cols.order[col], heatmap.cols.selected) > -1) {
                cellCtx.fillStyle = "rgba(0,0,0,0.1)";
                cellCtx.fillRect((col - this.startCol) * cz, 0, cz, (this.endRow - this.startRow) * rz);
                cellCtx.fillStyle = "white";
            }
        }

        // Vertical scroll
        var maxHeight = (this.endRow - this.startRow) * heatmap.rows.zoom;
        var iniY = Math.round(maxHeight * (this.startRow / heatmap.rows.order.length));
        var endY = Math.round(maxHeight * (this.endRow / heatmap.rows.order.length));
        var scrollVertCtx = canvasVScroll.get()[0].getContext('2d');
        scrollVertCtx.clearRect(0, 0, scrollVertCtx.canvas.width, scrollVertCtx.canvas.height)
        scrollVertCtx.fillStyle = "rgba(0,136,204,1)";
        scrollVertCtx.fillRect(0, iniY, 10, endY - iniY);

        // Horizontal scroll
        var scrollHorCtx = canvasHScroll.get()[0].getContext('2d');
        scrollHorCtx.clearRect(0, 0, scrollHorCtx.canvas.width, scrollHorCtx.canvas.height)
        scrollHorCtx.fillStyle = "rgba(0,136,204,1)";
        var maxWidth = (this.endCol - this.startCol) * heatmap.cols.zoom;
        var iniX = Math.round(maxWidth * (this.startCol / heatmap.cols.order.length));
        var endX = Math.round(maxWidth * (this.endCol / heatmap.cols.order.length));
        scrollHorCtx.fillRect(iniX, 0, endX - iniX, 10);

        lastPaint = new Date().getTime();

    };

    this.startRow = null;
    this.endRow = null;
    this.startCol = null;
    this.endCol = null;

    var hScrollMouseDown = false;

    this.onHScrollClick = function (e) {
        var maxWidth = (this.endCol - this.startCol) * heatmap.cols.zoom;
        var iniX = Math.round(maxWidth * (this.startCol / heatmap.cols.order.length));
        var endX = Math.round(maxWidth * (this.endCol / heatmap.cols.order.length));
        var pX = e.pageX - $(e.target).offset().left - ((endX - iniX) / 2);
        pX = (pX < 0 ? 0 : pX);
        heatmap.offset.left = Math.round((pX / maxWidth) * heatmap.cols.order.length);
        drawer.paint();
    };

    this.onHScrollMouseDown = function (e) {
        e.preventDefault();

        hScrollMouseDown = true;
    }

    this.onHScrollMouseUp = function (e) {
        e.preventDefault();

        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
            return;
        }

        hScrollMouseDown = false;
        drawer.paint();
    }

    this.onHScrollMouseMove = function (e) {

        if (hScrollMouseDown) {
            var maxWidth = (this.endCol - this.startCol) * heatmap.cols.zoom;
            var iniX = Math.round(maxWidth * (this.startCol / heatmap.cols.order.length));
            var endX = Math.round(maxWidth * (this.endCol / heatmap.cols.order.length));
            var pX = e.pageX - $(e.target).offset().left - ((endX - iniX) / 2);
            pX = (pX < 0 ? 0 : pX);
            heatmap.offset.left = Math.round((pX / maxWidth) * heatmap.cols.order.length);
            drawer.paint();
        }
    }

    var vScrollMouseDown = false;

    this.onVScrollClick = function (e) {
        var maxHeight = (this.endRow - this.startRow) * heatmap.rows.zoom;
        var iniY = Math.round(maxHeight * (this.startRow / heatmap.rows.order.length));
        var endY = Math.round(maxHeight * (this.endRow / heatmap.rows.order.length));

        var pY = e.pageY - $(e.target).offset().top - ((endY - iniY) / 2);
        pY = (pY < 0 ? 0 : pY);
        heatmap.offset.top = Math.round((pY / maxHeight) * heatmap.rows.order.length);
        drawer.paint();
    };

    this.onVScrollMouseDown = function (e) {
        e.preventDefault();

        vScrollMouseDown = true;
    }

    this.onVScrollMouseUp = function (e) {
        e.preventDefault();

        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
            return;
        }

        drawer.paint();
        vScrollMouseDown = false;
    }

    this.onVScrollMouseMove = function (e) {

        if (vScrollMouseDown) {
            var maxHeight = (this.endRow - this.startRow) * heatmap.rows.zoom;
            var iniY = Math.round(maxHeight * (this.startRow / heatmap.rows.order.length));
            var endY = Math.round(maxHeight * (this.endRow / heatmap.rows.order.length));

            var pY = e.pageY - $(e.target).offset().top - ((endY - iniY) / 2);
            pY = (pY < 0 ? 0 : pY);
            heatmap.offset.top = Math.round((pY / maxHeight) * heatmap.rows.order.length);
            drawer.paint();
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

        var c = Math.round(pX / heatmap.cols.zoom);
        var r = Math.round(pY / heatmap.rows.zoom);

        downX = null;
        downY = null;

        if (r == 0 && c == 0) {

            var col = Math.floor((e.originalEvent.pageX - position.left) / heatmap.cols.zoom) + heatmap.offset.left;
            var row = Math.floor((e.originalEvent.pageY - position.top) / heatmap.rows.zoom) + heatmap.offset.top;

            var cl = heatmap.cols.values.length;
            var pos = heatmap.rows.order[row] * cl + heatmap.cols.order[col];
            var value = heatmap.cells.values[pos];

            var details = $('table.heatmap div.detailsbox');
            if (value != null) {

                var boxTop = e.pageY - $(container).offset().top;
                var boxLeft = e.pageX - $(container).offset().left;
                var boxWidth;
                var boxHeight;

                var boxHtml = "<dl class='dl-horizontal'>";
                boxHtml += "<dt>Column</dt><dd>" + heatmap.cols.getValue(col, heatmap.cols.selectedValue) + "</dd>";
                boxHtml += "<dt>Row</dt><dd>" + heatmap.rows.getValue(row, heatmap.rows.selectedValue) + "</dd>";
                boxHtml += "<hr />";
                for (var i = 0; i < heatmap.cells.header.length; i++) {
                    if (heatmap.cells.header[i] == undefined) {
                        continue;
                    }
                    boxHtml += "<dt>" + heatmap.cells.header[i] + ":</dt><dd>";
                    var val = value[i];
                    if (!isNaN(val) && (val % 1 != 0)) {
                        val = Number(val).toFixed(3);
                    }
                    boxHtml += val;
                    boxHtml += "</dd>";
                }
                boxHtml += "</dl>";

                details.html(boxHtml);
                boxWidth = 300;
                boxHeight = 60 + (heatmap.cells.header.length * 20);


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
        drawer.paint();
    };

    this.onCellsMouseMove = function (e) {
        e.preventDefault();

        if (downX != null) {
            var position = $(e.target).offset();
            var pX = e.pageX - position.left - downX;
            var pY = e.pageY - position.top - downY;

            var c = Math.round(pX / heatmap.cols.zoom);
            var r = Math.round(pY / heatmap.rows.zoom);

            if (!(r == 0 && c == 0)) {

                heatmap.offset.top -= r;
                heatmap.offset.left -= c;
                drawer.paint();
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

            ncz = heatmap.rows.zoom + 3;
            ncz = ncz < 3 ? 3 : ncz;
            ncz = ncz > 32 ? 32 : ncz;

            // Zoom rows
            nrz = heatmap.rows.zoom + 3;
            nrz = nrz < 3 ? 3 : nrz;
            nrz = nrz > 32 ? 32 : nrz;

            var ml = Math.round(col - heatmap.offset.left - ((heatmap.cols.zoom * (col - heatmap.offset.left)) / ncz));
            var mt = Math.round(row - heatmap.offset.top - ((heatmap.rows.zoom * (row - heatmap.offset.top)) / nrz));

            heatmap.offset.left += ml;
            heatmap.offset.top += mt;
        } else {

            ncz = heatmap.cols.zoom - 3;
            ncz = ncz < 3 ? 3 : ncz;
            ncz = ncz > 32 ? 32 : ncz;

            // Zoom rows
            nrz = heatmap.rows.zoom - 3;
            nrz = nrz < 3 ? 3 : nrz;
            nrz = nrz > 32 ? 32 : nrz;

            var ml = Math.round(col - heatmap.offset.left - ((heatmap.cols.zoom * (col - heatmap.offset.left)) / ncz));
            var mt = Math.round(row - heatmap.offset.top - ((heatmap.rows.zoom * (row - heatmap.offset.top)) / nrz));

            heatmap.offset.left += ml;
            heatmap.offset.top += mt;
        }

        if (!(nrz == heatmap.rows.zoom && ncz == heatmap.cols.zoom)) {
            heatmap.cols.zoom = ncz;
            heatmap.rows.zoom = nrz;
            drawer.paint();
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

        var pos = $(e.target).offset();
        var col = Math.floor((e.pageX - pos.left) / heatmap.cols.zoom) + heatmap.offset.left;
        var row = Math.floor((e.pageY - pos.top) / heatmap.rows.zoom) + heatmap.offset.top;
        var zoomin = delta / 120 > 0;
        this.zoomHeatmap(zoomin, col, row);
    };

    var rowsMouseDown = false;
    var rowsSelecting = true;
    var rowsDownColumn = null;
    var rowsShiftColumn = null;
    var lastRowSelected = null;

    this.onRowsMouseDown = function (e) {
        rowsMouseDown = true;

        rowsShiftColumn = Math.floor((e.pageY - $(e.target).offset().top) / heatmap.rows.zoom) + heatmap.offset.top;
        rowsDownColumn = rowsShiftColumn;

        var index = $.inArray(heatmap.rows.order[rowsDownColumn], heatmap.rows.selected);
        if (index > -1) {
            rowsSelecting = false;
        } else {
            rowsSelecting = true;
        }
    };

    this.onRowsMouseUp = function (e) {
        rowsMouseDown = false;

        var row = Math.floor((e.pageY - $(e.target).offset().top) / heatmap.rows.zoom) + heatmap.offset.top;

        if (row == rowsDownColumn) {
            var index = $.inArray(heatmap.rows.order[row], heatmap.rows.selected);
            if (rowsSelecting) {
                if (index == -1) {
                    var x = e.pageX - $(e.target).offset().left;
                    if (x > 220) {
                        heatmap.cols.sorter = new jheatmap.sorters.ValueSorter(heatmap.cells.selectedValue, !(heatmap.cols.sorter.asc), heatmap.rows.order[row]);
                        heatmap.cols.sorter.sort(heatmap, "columns");
                    } else {
                        heatmap.rows.selected[heatmap.rows.selected.length] = heatmap.rows.order[row];
                    }
                }
            } else {

                var x = e.pageX - $(e.target).offset().left;
                if (x > 220) {
                    heatmap.cols.sorter = new jheatmap.sorters.AggregationValueSorter(heatmap.cells.selectedValue, !(heatmap.cols.sorter.asc), heatmap.rows.selected.slice(0));
                    heatmap.cols.sorter.sort(heatmap, "columns");
                } else {
                    var unselectRows = [ row ];

                    for (var i = row + 1; i < heatmap.rows.order.length; i++) {
                        var index = $.inArray(heatmap.rows.order[i], heatmap.rows.selected);
                        if (index > -1) {
                            unselectRows[unselectRows.length] = i;
                        } else {
                            break;
                        }
                    }

                    for (var i = row - 1; i > 0; i--) {
                        var index = $.inArray(heatmap.rows.order[i], heatmap.rows.selected);
                        if (index > -1) {
                            unselectRows[unselectRows.length] = i;
                        } else {
                            break;
                        }
                    }

                    for (var i = 0; i < unselectRows.length; i++) {
                        var index = $.inArray(heatmap.rows.order[unselectRows[i]], heatmap.rows.selected);
                        heatmap.rows.selected.splice(index, 1);
                    }
                }
            }
        }

        lastRowSelected = null;

        drawer.paint();
    };

    this.onRowsMouseMove = function (e) {

        if (rowsMouseDown) {
            var row = Math.floor((e.pageY - $(e.target).offset().top) / heatmap.rows.zoom) + heatmap.offset.top;

            if (rowsSelecting) {
                var index = $.inArray(heatmap.rows.order[row], heatmap.rows.selected);
                if (index == -1) {
                    heatmap.rows.selected[heatmap.rows.selected.length] = heatmap.rows.order[row];

                    // Select the gap
                    if (lastRowSelected != null && Math.abs(lastRowSelected - row) > 1) {
                        var upRow = (lastRowSelected < row ? lastRowSelected : row );
                        var downRow = (lastRowSelected < row ? row : lastRowSelected );
                        for (var i = upRow + 1; i < downRow; i++) {
                            heatmap.rows.selected[heatmap.rows.selected.length] = heatmap.rows.order[i];
                        }
                    }
                    lastRowSelected = row;

                }
            } else {
                var diff = row - rowsShiftColumn;
                if (diff != 0) {
                    if (diff > 0) {
                        if ($.inArray(heatmap.rows.order[heatmap.rows.order.length - 1], heatmap.rows.selected) == -1) {
                            for (var i = heatmap.rows.order.length - 2; i >= 0; i--) {
                                var index = $.inArray(heatmap.rows.order[i], heatmap.rows.selected);
                                if (index != -1) {
                                    var nextRow = heatmap.rows.order[i + 1];
                                    heatmap.rows.order[i + 1] = heatmap.rows.order[i];
                                    heatmap.rows.order[i] = nextRow;
                                }
                            }
                        }
                    } else {
                        if ($.inArray(heatmap.rows.order[0], heatmap.rows.selected) == -1) {
                            for (var i = 1; i < heatmap.rows.order.length; i++) {
                                var index = $.inArray(heatmap.rows.order[i], heatmap.rows.selected);
                                if (index != -1) {
                                    var prevRow = heatmap.rows.order[i - 1];
                                    heatmap.rows.order[i - 1] = heatmap.rows.order[i];
                                    heatmap.rows.order[i] = prevRow;
                                }
                            }
                        }
                    }
                    rowsShiftColumn = row;
                }
            }

            drawer.paint();
        }
    };

    this.onRowsKeyPress = function (e) {

        // 'H' or 'h'
        if (e.keyCode == 72 || e.charCode == 104) {

            if (heatmap.rows.selected.length > 0) {
                heatmap.rows.order = $.grep(heatmap.rows.order, function (value) {
                    return heatmap.rows.selected.indexOf(value) == -1;
                });
                drawer.paint();
            }
        }

        // 'S' or 's'
        if (e.keyCode == 83 || e.charCode == 115) {

            heatmap.rows.order = [];
            for (var c = 0; c < heatmap.rows.values.length; c++) {
                heatmap.rows.order[heatmap.rows.order.length] = c;
            }
            heatmap.rows.sorter.sort(heatmap, "rows");
            drawer.paint();
        }

        // 'R' or 'r'
        if (e.keyCode == 82 || e.charCode == 114) {

            heatmap.rows.selected = [];
            drawer.paint();
        }

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

    this.handleFocus = function (e) {

        if (e.type == 'mouseover') {
            e.target.focus();
            return false;
        } else if (e.type == 'mouseout') {
            e.target.blur();
            return false;
        }

        return true;
    };

};