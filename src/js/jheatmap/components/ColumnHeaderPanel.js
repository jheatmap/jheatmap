
jheatmap.components.ColumnHeaderPanel = function(drawer, heatmap) {

    this.heatmap = heatmap;

    // Calculate label size
    if (heatmap.cols.labelSize == undefined) {

    }

    // Create markup
    this.markup = $("<th>");
    this.canvas = $("<canvas class='header' id='colCanvas' width='" + heatmap.size.width + "' height='"+heatmap.cols.labelSize+"' tabindex='3'></canvas>");
    this.markup.append(this.canvas);
    this.canvas.bind('contextmenu', function(e){
        return false;
    });

    // Event functions
    var colsMouseDown = false;
    var colsSelecting = true;
    var colsDownColumn = null;
    var colsShiftColumn = null;
    var lastColSelected = null;

    var onMouseDown = function (e) {

        colsMouseDown = true;

        colsShiftColumn = Math.floor((e.pageX - $(e.target).offset().left) / heatmap.cols.zoom) + heatmap.offset.left;
        colsDownColumn = colsShiftColumn;

        var index = $.inArray(heatmap.cols.order[colsDownColumn], heatmap.cols.selected);
        colsSelecting = index <= -1;
    };

    var onMouseUp = function (e) {

        colsMouseDown = false;

        var col = Math.floor((e.pageX - $(e.target).offset().left) / heatmap.cols.zoom) + heatmap.offset.left;

        if (col == colsDownColumn) {
            var index = $.inArray(heatmap.cols.order[col], heatmap.cols.selected);
            if (colsSelecting) {
                if (index == -1) {
                    var y = e.pageY - $(e.target).offset().top;
                    if (y > (heatmap.cols.labelSize - 10)) {
                        heatmap.rows.sorter = new jheatmap.sorters.ValueSorter(heatmap.cells.selectedValue, !(heatmap.rows.sorter.asc), heatmap.cols.order[col]);
                        heatmap.rows.sorter.sort(heatmap, "rows");
                    } else {
                        heatmap.cols.selected[heatmap.cols.selected.length] = heatmap.cols.order[col];
                    }
                }
            } else {
                var y = e.pageY - $(e.target).offset().top;
                if (y > (heatmap.cols.labelSize - 10)) {
                    heatmap.rows.sorter = new heatmap.rows.DefaultAggregationSorter(heatmap.cells.selectedValue, !(heatmap.rows.sorter.asc), heatmap.cols.selected.slice(0));
                    heatmap.rows.sorter.sort(heatmap, "rows");
                } else {
                    var unselectCols = [ col ];

                    for (var i = col + 1; i < heatmap.cols.order.length; i++) {
                        var index = $.inArray(heatmap.cols.order[i], heatmap.cols.selected);
                        if (index > -1) {
                            unselectCols[unselectCols.length] = i;
                        } else {
                            break;
                        }
                    }

                    for (var i = col - 1; i > 0; i--) {
                        var index = $.inArray(heatmap.cols.order[i], heatmap.cols.selected);
                        if (index > -1) {
                            unselectCols[unselectCols.length] = i;
                        } else {
                            break;
                        }
                    }

                    for (var i = 0; i < unselectCols.length; i++) {
                        var index = $.inArray(heatmap.cols.order[unselectCols[i]], heatmap.cols.selected);
                        heatmap.cols.selected.splice(index, 1);
                    }
                }
            }
        }

        lastColSelected = null;

        drawer.paint();
    }

    var onMouseMove = function (e) {

        if (colsMouseDown) {
            var col = Math.floor((e.pageX - $(e.target).offset().left) / heatmap.cols.zoom) + heatmap.offset.left;

            if (colsSelecting) {
                var index = $.inArray(heatmap.cols.order[col], heatmap.cols.selected);
                if (index == -1) {
                    heatmap.cols.selected[heatmap.cols.selected.length] = heatmap.cols.order[col];

                    // Select the gap
                    if (lastColSelected != null && Math.abs(lastColSelected - col) > 1) {
                        var upCol = (lastColSelected < col ? lastColSelected : col );
                        var downCol = (lastColSelected < col ? col : lastColSelected );
                        for (var i = upCol + 1; i < downCol; i++) {
                            heatmap.cols.selected[heatmap.cols.selected.length] = heatmap.cols.order[i];
                        }
                    }
                    lastColSelected = col;
                }
            } else {
                var diff = col - colsShiftColumn;
                if (diff != 0) {
                    if (diff > 0) {
                        if ($.inArray(heatmap.cols.order[heatmap.cols.order.length - 1], heatmap.cols.selected) == -1) {
                            for (var i = heatmap.cols.order.length - 2; i >= 0; i--) {
                                if ($.inArray(heatmap.cols.order[i], heatmap.cols.selected) != -1) {
                                    var nextCol = heatmap.cols.order[i + 1];
                                    heatmap.cols.order[i + 1] = heatmap.cols.order[i];
                                    heatmap.cols.order[i] = nextCol;
                                }
                            }
                        }
                    } else {
                        if ($.inArray(heatmap.cols.order[0], heatmap.cols.selected) == -1) {
                            for (var i = 1; i < heatmap.cols.order.length; i++) {
                                if ($.inArray(heatmap.cols.order[i], heatmap.cols.selected) != -1) {
                                    var prevCol = heatmap.cols.order[i - 1];
                                    heatmap.cols.order[i - 1] = heatmap.cols.order[i];
                                    heatmap.cols.order[i] = prevCol;
                                }
                            }
                        }
                    }
                    colsShiftColumn = col;
                }
            }

            drawer.paint();
        }
    };

    var onKeyPress = function (e) {

        var charCode = e.which || e.keyCode;

        for (var key in heatmap.actions) {
            var action = heatmap.actions[key];

            if (action.columns != undefined && action.shortCut != undefined && action.keyCodes.indexOf(charCode) != -1) {
                action.columns();
            }
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
    this.canvas.bind('mouseover', function (e) {
        drawer.handleFocus(e);
    });
    this.canvas.bind('mouseout', function (e) {
        drawer.handleFocus(e);
    });
    this.canvas.bind('keypress', function (e) {
        onKeyPress(e);
    });

};

jheatmap.components.ColumnHeaderPanel.prototype.paint = function() {

    var heatmap = this.heatmap;

    var cz = heatmap.cols.zoom;
    var textSpacing = 5;
    var startCol = heatmap.offset.left;
    var endCol = heatmap.offset.right;

    var colCtx = this.canvas.get()[0].getContext('2d');
    colCtx.clearRect(0, 0, colCtx.canvas.width, colCtx.canvas.height);

    colCtx.fillStyle = "black";
    colCtx.textAlign = "right";
    colCtx.textBaseline = "middle";
    colCtx.font = (cz > 12 ? 12 : cz) + "px Helvetica Neue,Helvetica,Arial,sans-serif";

    for (var c = startCol; c < endCol; c++) {
        var value = heatmap.cols.getValue(c, heatmap.cols.selectedValue);
        colCtx.save();
        colCtx.translate((c - startCol) * cz + (cz / 2), heatmap.cols.labelSize - 5);
        colCtx.rotate(Math.PI / 2);
        colCtx.fillText(value, -textSpacing, 0);
        colCtx.restore();

        // Order mark
        colCtx.save();
        colCtx.translate(Math.round(((c - startCol) * cz) + (cz / 2)), heatmap.cols.labelSize - 4)
        colCtx.rotate(Math.PI / 4);
        if (    (heatmap.rows.sorter.field == heatmap.cells.selectedValue) &&
            ($.inArray(heatmap.cols.order[c], heatmap.rows.sorter.indices) > -1)
            ) {
            jheatmap.components.OrderSymbol(colCtx, heatmap.rows.sorter.asc);
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
            colCtx.fillRect((c - startCol) * cz, 0, cz, heatmap.cols.labelSize);
            colCtx.fillStyle = "black";
        }

        if (heatmap.search != null && value.toUpperCase().indexOf(heatmap.search.toUpperCase()) != -1) {
            colCtx.fillStyle = "rgba(255,255,0,0.3)";
            colCtx.fillRect((c - startCol) * cz, 0, cz, heatmap.cols.labelSize);
            colCtx.fillStyle = "black";
        }
    }

};
