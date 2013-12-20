
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
    var eventTarget = this.canvas;

    var onKeyPress = function (e) {
        var charCode = e.which || e.keyCode;
        for (var key in heatmap.actions) {
            var action = heatmap.actions[key];

            if (action.columns != undefined && action.shortCut != undefined && action.keyCodes.indexOf(charCode) != -1) {
                action.columns();
            }
        }
    };

    // Return true if the col is selected
    var isSelected = function(col) {
        return $.inArray(heatmap.cols.order[col], heatmap.cols.selected) > -1;
    };

     // Computes the relative to canvas x, y and the row
     var getCenter = function (e) {
           e.gesture.center.x = e.gesture.center.pageX - eventTarget.offset().left;
           e.gesture.center.y = e.gesture.center.pageY - eventTarget.offset().top;
           e.gesture.center.col = Math.floor(e.gesture.center.x / heatmap.cols.zoom) + heatmap.offset.left;
           return e.gesture.center;
     };

     // Select multiple rows or move the selected rows
     var firstCol;
     var firstX;
     var firstZoom;
     var doingPinch = false;
     var lastMovedCol = null;
     var movingSelection;

     this.canvas.bind('touch', function (e) {
         e.gesture.preventDefault();
         var center = getCenter(e);
         firstCol = center.col;
         firstX = center.x;
         firstZoom = heatmap.cols.zoom;

         lastMovedCol = firstCol;
         movingSelection = isSelected(firstCol);
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

         if (firstCol == center.col) {
             return;
         }

         if (movingSelection) {
             var diff = center.col - lastMovedCol;
             if (diff != 0) {
                 if (diff > 0) {
                     for (var r=0; r < diff; r++) {
                        if ($.inArray(heatmap.cols.order[heatmap.cols.order.length - 1], heatmap.cols.selected) == -1) {
                            for (var i = heatmap.cols.order.length - 2; i >= 0; i--) {
                                var index = $.inArray(heatmap.cols.order[i], heatmap.cols.selected);
                                if (index != -1) {
                                    var nextCol = heatmap.cols.order[i + 1];
                                    heatmap.cols.order[i + 1] = heatmap.cols.order[i];
                                    heatmap.cols.order[i] = nextCol;
                                }
                            }
                        }
                     }
                 } else {
                     for (var r=0; r < -diff; r++) {
                        if ($.inArray(heatmap.cols.order[0], heatmap.cols.selected) == -1) {
                            for (var i = 1; i < heatmap.cols.order.length; i++) {
                                var index = $.inArray(heatmap.cols.order[i], heatmap.cols.selected);
                                if (index != -1) {
                                    var prevCol = heatmap.cols.order[i - 1];
                                    heatmap.cols.order[i - 1] = heatmap.cols.order[i];
                                    heatmap.cols.order[i] = prevCol;
                                }
                            }
                        }
                     }
                 }
                 lastMovedCol = center.col;
             }
         }
         else
         {
            heatmap.cols.selected = [];
            if (firstCol < center.col) {
                for (var i=firstCol; i<=center.col; i++) {
                    heatmap.cols.selected[heatmap.cols.selected.length] = heatmap.cols.order[i];
                }
            } else {
                for (var i=center.col; i<=firstCol; i++) {
                    heatmap.cols.selected[heatmap.cols.selected.length] = heatmap.cols.order[i];
                }
            }
         }

         drawer.paint();
     });

     this.canvas.bind('tap', function (e) {
         e.gesture.preventDefault();

        var center = getCenter(e);
        if (center.y > 200)
        {
            // Sort the col
            heatmap.rows.sorter = new jheatmap.sorters.ValueSorter(heatmap.cells.selectedValue, !(heatmap.rows.sorter.asc), heatmap.cols.order[center.col]);
            heatmap.rows.sorter.sort(heatmap, "rows");
        }
        else if (!isSelected(center.col))
        {
            // Select the row
            if (heatmap.cols.selected.length == 0) {
                heatmap.cols.selected = [ heatmap.cols.order[center.col] ];
            } else {
                heatmap.cols.selected = [];
            }
        }

        drawer.paint();
     });

     this.canvas.bind('doubletap', function(e) {
         e.gesture.preventDefault();

        var center = getCenter(e);
        if (isSelected(center.col))
        {
               heatmap.cols.selected = [];
        }

        drawer.paint();
     });

     var zoom = function(scale) {

          var nz = firstZoom * scale;
          nz = nz < 3 ? 3 : nz;
          nz = nz > 64 ? 64 : nz;

          if (nz != heatmap.cols.zoom) {
              heatmap.cols.zoom = Math.round(nz);
              heatmap.offset.left = firstCol - Math.floor(firstX / heatmap.cols.zoom);
          }

     };

     this.canvas.bind('pinch', function (e) {
         e.gesture.preventDefault();
         doingPinch = true;
         zoom(e.gesture.scale);
     });

     this.canvas.bind('transformend', function (e) {
        drawer.paint();
     });

     this.canvas.bind('mousewheel', function (e, delta, deltaX, deltaY) {
              e.preventDefault();

              if (e.shiftKey) {

                 // Zoom
                 firstZoom = heatmap.cols.zoom;
                 firstX = e.pageX - eventTarget.offset().left;
                 firstCol = Math.floor(firstX / heatmap.cols.zoom) + heatmap.offset.left;
                 var scale = delta > 0 ? 1 + (0.2 * delta) : 1 / (1 + (0.2 * -delta));
                 zoom(scale);

              } else {

	              // Normal speed
	              var momentum = Math.round(heatmap.size.width / (7 * heatmap.cols.zoom));

	              // Increase speed when user swipes the wheel (the increment depends on heatmap size).
	              momentum = Math.abs(delta) > 1 ? Math.round(heatmap.cols.values.length / (20*Math.abs(delta))) : momentum;

	              heatmap.offset.left = heatmap.offset.left - delta * momentum;

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
         onKeyPress(e);
     });
};

jheatmap.components.ColumnHeaderPanel.prototype.paint = function() {

    var heatmap = this.heatmap;

    var cz = heatmap.cols.zoom;
    var textSpacing = 5;
    var startCol = heatmap.offset.left;
    var endCol = heatmap.offset.right;

    var canvas = this.canvas.get()[0];
    var colCtx = canvas.getContext('2d');

    // Bug clear canvas workaround
    androidBug39247 = function() {
      canvas.style.opacity = 0.99;
      setTimeout(function() {
      canvas.style.opacity = 1;
      }, 1);
    }

    colCtx.clearRect(0, 0, colCtx.canvas.width, colCtx.canvas.height);
    androidBug39247();

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
