
jheatmap.components.RowHeaderPanel = function(drawer, heatmap) {

    this.heatmap = heatmap;

    // Create markup
    this.markup = $("<td>", {"class": "row" });
    this.canvas = $("<canvas class='header' width='" + heatmap.rows.labelSize + "' height='" + heatmap.size.height + "' tabindex='1'></canvas>");

    this.markup.append(this.canvas);
    this.canvas.bind('contextmenu', function(e){
        return false;
    });

    // Event functions
	var eventTarget = this.canvas;

    // Return true if the row is selected
    var isSelected = function(row) {
        return $.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1;
    };

    // Computes the relative to canvas x, y and the row
    var getCenter = function (e) {
          e.gesture.center.x = e.gesture.center.pageX - eventTarget.offset().left;
          e.gesture.center.y = e.gesture.center.pageY - eventTarget.offset().top;
          e.gesture.center.row = Math.floor(e.gesture.center.y / heatmap.rows.zoom) + heatmap.offset.top;
          return e.gesture.center;
    };

    // Select multiple rows or move the selected rows
    var firstRow;
    var firstY;
    var firstZoom;
    var doingPinch = false;
    var lastMovedRow = null;
    var movingSelection;

    this.canvas.bind('touch', function (e) {
        e.gesture.preventDefault();
        var center = getCenter(e);
        firstRow = center.row;
        firstY = center.y;
        firstZoom = heatmap.rows.zoom;

        lastMovedRow = firstRow;
        movingSelection = isSelected(firstRow);
    });
    this.canvas.bind('release', function (e) {
        doingPinch = false;
    });
    this.canvas.bind('drag', function (e) {
        e.gesture.preventDefault();

        if (doingPinch) {
            return;
        }

        var center = getCenter(e);

        if (firstRow == center.row) {
            return;
        }

        if (movingSelection) {
            var diff = center.row - lastMovedRow;
            if (diff != 0) {
                if (diff > 0) {
                    for (var r=0; r < diff; r++) {
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
                    }
                } else {
                    for (var r=0; r < -diff; r++) {
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
                }
                lastMovedRow = center.row;
            }
        }
        else
        {
			heatmap.rows.selected = [];
			if (firstRow < center.row) {
			    for (var i=firstRow; i<=center.row; i++) {
			        heatmap.rows.selected[heatmap.rows.selected.length] = heatmap.rows.order[i];
			    }
			} else {
			    for (var i=center.row; i<=firstRow; i++) {
			        heatmap.rows.selected[heatmap.rows.selected.length] = heatmap.rows.order[i];
			    }
			}
        }

        drawer.paint();
    });

    this.canvas.bind('tap', function (e) {
        e.gesture.preventDefault();

       var center = getCenter(e);
       if (center.x > 200)
       {
           // Sort the row
           heatmap.cols.sorter = new jheatmap.sorters.ValueSorter(heatmap.cells.selectedValue, !(heatmap.cols.sorter.asc), heatmap.rows.order[center.row]);
           heatmap.cols.sorter.sort(heatmap, "columns");
       }
       else if (!isSelected(center.row))
       {
           // Select the row
           if (heatmap.rows.selected.length == 0) {
               heatmap.rows.selected = [ heatmap.rows.order[center.row] ];
           } else {
               heatmap.rows.selected = [];
           }
       }

       drawer.paint();
    });

    this.canvas.bind('doubletap', function(e) {
        e.gesture.preventDefault();

       var center = getCenter(e);
       if (isSelected(center.row))
       {
              heatmap.rows.selected = [];
       }

       drawer.paint();
    });

    var zoom = function(scale) {

        var nrz = firstZoom * scale;
        nrz = nrz < 3 ? 3 : nrz;
        nrz = nrz > 64 ? 64 : nrz;

        if (nrz != heatmap.rows.zoom) {
            heatmap.rows.zoom = Math.round(nrz);
            heatmap.offset.top = firstRow - Math.floor(firstY / heatmap.rows.zoom);
        }
    };

    this.canvas.bind('pinch', function (e) {
        e.gesture.preventDefault();
        doingPinch = true;
        zoom(e.gesture.scale)
    });

    this.canvas.bind('transformend', function (e) {
       drawer.paint();
    });

    this.canvas.bind('mousewheel', function (e, delta, deltaX, deltaY) {
         e.preventDefault();

         if (e.shiftKey) {

             // Zoom
             firstZoom = heatmap.rows.zoom;
             firstY = e.pageY - eventTarget.offset().top;
             firstRow = Math.floor(firstY / heatmap.rows.zoom) + heatmap.offset.top;
             var scale = delta > 0 ? 1 + (0.2 * delta) : 1 / (1 + (0.2 * -delta));
             zoom(scale);

         } else {
             // Scroll
             // Normal speed
	         var momentum = Math.round(heatmap.size.height / (7 * heatmap.rows.zoom));

	         // Increase speed when user swipes the wheel (the increment depends on heatmap size).
	         momentum = Math.abs(delta) > 1 ? Math.round(heatmap.rows.values.length / (20*Math.abs(delta))) : momentum;

	         heatmap.offset.top = heatmap.offset.top - delta * momentum;
	     }
         drawer.paint();
    });

    this.canvas.bind('mouseover', function(e) {
        drawer.handleFocus(e);
    });
    this.canvas.bind('mouseout', function(e) {
        drawer.handleFocus(e);
    });

    this.canvas.bind('keypress', function (e) {
        var charCode = e.which || e.keyCode;
        for (var key in heatmap.actions) {
            var action = heatmap.actions[key];

            if (action.rows != undefined && action.shortCut != undefined && action.keyCodes.indexOf(charCode) != -1) {
                action.rows();
            }
        }
    });



};

jheatmap.components.RowHeaderPanel.prototype.paint = function() {

    var heatmap = this.heatmap;

    var rz = heatmap.rows.zoom;
    var textSpacing = 5;
    var startRow = heatmap.offset.top;
    var endRow = heatmap.offset.bottom;

    var canvas = this.canvas.get()[0];
    var rowCtx = canvas.getContext('2d');

    // Bug clear canvas workaround
    androidBug39247 = function() {
      canvas.style.opacity = 0.99;
      setTimeout(function() {
      canvas.style.opacity = 1;
      }, 1);
    }

    rowCtx.clearRect(0, 0, rowCtx.canvas.width, rowCtx.canvas.height);
    androidBug39247();

    rowCtx.fillStyle = "black";
    rowCtx.textAlign = "right";
    rowCtx.textBaseline = "middle";
    rowCtx.font = (rz > 12 ? 12 : rz) + "px Helvetica Neue,Helvetica,Arial,sans-serif";

    for (var row = startRow; row < endRow; row++) {
        var value = heatmap.rows.getValue(row, heatmap.rows.selectedValue);
        rowCtx.fillText(value, (heatmap.rows.labelSize - 5) - textSpacing, ((row - startRow) * rz) + (rz / 2));

        // Order mark
        rowCtx.save();
        rowCtx.translate((heatmap.rows.labelSize - 4), ((row - startRow) * rz) + (rz / 2));
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
            rowCtx.fillRect(0, ((row - startRow) * rz), heatmap.rows.labelSize, rz);
            rowCtx.fillStyle = "black";
        }

        if (heatmap.search != null && value.toUpperCase().indexOf(heatmap.search.toUpperCase()) != -1) {
            rowCtx.fillStyle = "rgba(255,255,0,0.3)";
            rowCtx.fillRect(0, ((row - startRow) * rz), heatmap.rows.labelSize, rz);
            rowCtx.fillStyle = "black";
        }
    }

};