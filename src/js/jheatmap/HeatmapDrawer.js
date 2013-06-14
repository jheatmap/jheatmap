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
    var canvasAnnColHeader = null;
    var canvasAnnCols = null;
    var canvasHScroll = null;
    var canvasVScroll = null;
    var lastPaint = null;

    var textSpacing = 5;

    // Components
    var controlPanel = new jheatmap.components.ControlsPanel(drawer, heatmap);

    var columnHeaderPanel = new jheatmap.components.ColumnHeaderPanel(drawer, heatmap);
    var columnAnnotationPanel = new jheatmap.components.ColumnAnnotationPanel(drawer, heatmap);

    var rowHeaderPanel = new jheatmap.components.RowHeaderPanel(drawer, heatmap);
    var rowAnnotationPanel = new jheatmap.components.RowAnnotationPanel(drawer, heatmap);

    var cellsBodyPanel = new jheatmap.components.CellBodyPanel(drawer, heatmap);


    /**
     * Build the heatmap.
     */
    this.build = function () {

        // Reset
        container.html('');

        var table = $("<table>", { "class": "heatmap"});
        var firstRow = $("<tr>");
        table.append(firstRow);

        firstRow.append(controlPanel.markup);

        firstRow.append(columnHeaderPanel.markup);

        if (rowAnnotationPanel.visible) {
            firstRow.append(rowAnnotationPanel.header);
        }
        firstRow.append($("<th>", {'class': 'border', 'rowspan': rowAnnotationPanel.span }));
        firstRow.append($("<th>", {'class': 'border', 'rowspan': rowAnnotationPanel.span }));

        if (columnAnnotationPanel.visible) {
            table.append(columnAnnotationPanel.markup);
        }

        // Add left border
        var tableRow = $('<tr>');
        tableRow.append(rowHeaderPanel.markup);
        tableRow.append(cellsBodyPanel.markup);

        if (rowAnnotationPanel.visible) {
            tableRow.append(rowAnnotationPanel.body);
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
        columnHeaderPanel.paint();

        // Rows headers
        rowHeaderPanel.paint();

        // Row annotations
        rowAnnotationPanel.paint();

        // Columns annotations
        columnAnnotationPanel.paint();

        // Cells
        cellsBodyPanel.paint();

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