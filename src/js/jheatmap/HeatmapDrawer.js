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
    var controlPanel = new jheatmap.components.ControlsPanel(drawer, heatmap);
    var columnHeaderPanel = new jheatmap.components.ColumnHeaderPanel(drawer, heatmap);
    var columnAnnotationPanel = new jheatmap.components.ColumnAnnotationPanel(drawer, heatmap);
    var rowHeaderPanel = new jheatmap.components.RowHeaderPanel(drawer, heatmap);
    var rowAnnotationPanel = new jheatmap.components.RowAnnotationPanel(drawer, heatmap);
    var cellsBodyPanel = new jheatmap.components.CellBodyPanel(drawer, heatmap);
    var verticalScrollBar = new jheatmap.components.VerticalScrollBar(drawer, heatmap);
    var horizontalScrollBar = new jheatmap.components.HorizontalScrollBar(drawer, heatmap);

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

        tableRow.append(verticalScrollBar.markup);
        tableRow.append("<td class='borderL'>&nbsp;</td>");
        table.append(tableRow);

        var scrollRow = $("<tr class='horizontalScroll'>");
        scrollRow.append("<td class='border' style='font-size: 9px; vertical-align: right; padding-left: 10px; padding-top: 6px;'>" +
            "<span>powered by <a href='http://jheatmap.github.io/jheatmap' target='_blank'>jHeatmap</a></span>" +
            "</td>");

        scrollRow.append(horizontalScrollBar.markup);
        scrollRow.append("<td class='border'></td>");

        if (heatmap.rows.annotations.length > 0) {
            scrollRow.append("<td class='border'></td>");
        }

        scrollRow.append("<td class='border'></td>");
        table.append(scrollRow);

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
        $('.detailsbox').hammer({
             tap_always: false,
             swipe: false
         });
        $('canvas').hammer({
            tap_always: false,
            swipe: false
        });
        Hammer.plugins.fakeMultitouch();

    };

    /**
     * Paint the heatmap.
     */
    this.paint = function () {

        // Minimum zooms
        var mcz = Math.max(3, Math.round(heatmap.size.width / heatmap.cols.order.length));
        var mrz = Math.max(3, Math.round(heatmap.size.height / heatmap.rows.order.length));

        // Zoom columns
        var cz = heatmap.cols.zoom;
        cz = cz < mcz ? mcz : cz;
        cz = cz > 64 ? 64 : cz;
        heatmap.cols.zoom = cz;

        // Zoom rows
        var rz = heatmap.rows.zoom;
        rz = rz < mrz ? mrz : rz;
        rz = rz > 64 ? 64 : rz;
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

        heatmap.offset.bottom = Math.min(heatmap.offset.top + maxRows, heatmap.rows.order.length);
        heatmap.offset.right = Math.min(heatmap.offset.left + maxCols, heatmap.cols.order.length);

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
        verticalScrollBar.paint();

        // Horizontal scroll
        horizontalScrollBar.paint();

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

    /**
     *
     * @param e
     * @returns {boolean}
     */
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