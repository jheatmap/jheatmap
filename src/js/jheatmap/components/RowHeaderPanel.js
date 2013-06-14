
jheatmap.components.RowHeaderPanel = function(drawer, heatmap) {

    this.heatmap = heatmap;

    // Create markup
    this.markup = $("<td>", {"class": "row" });
    this.canvas = $("<canvas class='header' width='230' height='" + heatmap.size.height + "' tabindex='1'></canvas>");
    this.markup.append(this.canvas);

    // Event functions

    var rowsMouseDown = false;
    var rowsSelecting = true;
    var rowsDownColumn = null;
    var rowsShiftColumn = null;
    var lastRowSelected = null;

    var onMouseDown = function (e) {
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

    var onMouseUp = function (e) {
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
                    heatmap.cols.sorter = new heatmap.cols.DefaultAggregationSorter(heatmap.cells.selectedValue, !(heatmap.cols.sorter.asc), heatmap.rows.selected.slice(0));
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

    var onMouseMove = function (e) {

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

    var onKeyPress = function (e) {

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

    // Bind events
    this.canvas.bind('mousedown', function (e) {
        onMouseDown(e);
    });
    this.canvas.bind('mousemove', function (e) {
        onMouseMove(e);
    });
    this.canvas.bind('mouseup', function (e) {
        onMouseUp(e);
    });
    this.canvas.bind('mouseover', drawer.handleFocus);
    this.canvas.bind('mouseout', drawer.handleFocus);
    this.canvas.bind('keypress', function (e) {
        onKeyPress(e);
    });

};

jheatmap.components.RowHeaderPanel.prototype.paint = function() {

    var heatmap = this.heatmap;

    var rz = heatmap.rows.zoom;
    var textSpacing = 5;
    var startRow = heatmap.offset.top;
    var endRow = heatmap.offset.bottom;

    var rowCtx = this.canvas.get()[0].getContext('2d');
    rowCtx.clearRect(0, 0, heatmap.size.width, rowCtx.canvas.height);
    rowCtx.fillStyle = "black";
    rowCtx.textAlign = "right";
    rowCtx.textBaseline = "middle";
    rowCtx.font = (rz > 12 ? 12 : rz) + "px Helvetica Neue,Helvetica,Arial,sans-serif";

    for (var row = startRow; row < endRow; row++) {
        var value = heatmap.rows.getValue(row, heatmap.rows.selectedValue);
        rowCtx.fillText(value, 225 - textSpacing, ((row - startRow) * rz) + (rz / 2));

        // Order mark
        rowCtx.save();
        rowCtx.translate(226, ((row - startRow) * rz) + (rz / 2));
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
            rowCtx.fillRect(0, ((row - startRow) * rz), 230, rz);
            rowCtx.fillStyle = "black";
        }

        if (heatmap.search != null && value.toUpperCase().indexOf(heatmap.search.toUpperCase()) != -1) {
            rowCtx.fillStyle = "rgba(255,255,0,0.3)";
            rowCtx.fillRect(0, ((row - startRow) * rz), 230, rz);
            rowCtx.fillStyle = "black";
        }
    }

};