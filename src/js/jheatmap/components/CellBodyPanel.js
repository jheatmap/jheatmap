
jheatmap.components.CellBodyPanel = function(drawer, heatmap) {
    this.heatmap = heatmap;

    // Create markup
    this.markup = $('<td>');
    this.canvas = $("<canvas width='" + heatmap.size.width + "' height='" + heatmap.size.height + "' tabindex='2'></canvas>");
    this.markup.append(this.canvas);
    this.canvas.bind('contextmenu', function(e){
        return false;
    });

    // Events
    var downX = null;
    var downY = null;
    var lastX = null;
    var lastY = null;
    var eventTarget = this.canvas;

    var onMouseUp = function (e, pageX, pageY) {
        e.preventDefault();

        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
            return;
        }

        var position = eventTarget.offset();
        var pX = pageX - position.left - downX;
        var pY = pageY - position.top - downY;

        var c = Math.round(pX / heatmap.cols.zoom);
        var r = Math.round(pY / heatmap.rows.zoom);

        downX = null;
        downY = null;

        if (r == 0 && c == 0) {

            var col = Math.floor((pageX - position.left) / heatmap.cols.zoom) + heatmap.offset.left;
            var row = Math.floor((pageY - position.top) / heatmap.rows.zoom) + heatmap.offset.top;

            var details = $('table.heatmap div.detailsbox');
            var boxTop = pageY - $(heatmap.options.container).offset().top;
            var boxLeft = pageX - $(heatmap.options.container).offset().left;

            heatmap.paintCellDetails(row, col, heatmap, boxTop, boxLeft, details);

        }
        drawer.paint();
    };

    var onMouseMove = function (e, pageX, pageY) {
        e.preventDefault();

        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
            return;
        }

        if (downX != null) {
            var position = eventTarget.offset();
            var pX = pageX - position.left - lastX;
            var pY = pageY - position.top - lastY;

            var c = Math.round(pX / heatmap.cols.zoom);
            var r = Math.round(pY / heatmap.rows.zoom);

            if (!(r == 0 && c == 0)) {
                heatmap.offset.top -= r;
                heatmap.offset.left -= c;
                drawer.paint();
                lastX = pageX - position.left;
                lastY = pageY - position.top;
            }
        }

    };

    var onMouseDown = function (e, pageX, pageY) {
        e.preventDefault();

        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
              var pos = eventTarget.offset();
              var pageX1 = e.originalEvent.touches[0].pageX;
              var pageY1 = e.originalEvent.touches[0].pageY;
              var pageX2 = e.originalEvent.touches[1].pageX;
              var pageY2 = e.originalEvent.touches[1].pageY;
              x = Math.round(pageX1 + (pageX2 - pageX1)/2 ) - pos.left;
              y = Math.round(pageY1 + (pageY2-pageY1)/2) - pos.top;
              downX = null;
              downY = null;
              return;
        }

        var position = eventTarget.offset();
        downX = pageX - position.left;
        downY = pageY - position.top;
        lastX = downX;
        lastY = downY;
    };

    var col, row;
    var x, y;
    var startWheel = new Date().getTime();

    var zoomHeatmap = function (inc, zoomin, col, row) {

        var ncz = null;
        var nrz = null;

        if (zoomin) {
            ncz = heatmap.cols.zoom + inc;
            nrz = heatmap.rows.zoom + inc;
        } else {
            ncz = heatmap.cols.zoom - inc;
            nrz = heatmap.rows.zoom - inc;
        }

        ncz = ncz < 3 ? 3 : ncz;
        ncz = ncz > 64 ? 64 : ncz;

        nrz = nrz < 3 ? 3 : nrz;
        nrz = nrz > 64 ? 64 : nrz;

        if (!(nrz == heatmap.rows.zoom && ncz == heatmap.cols.zoom)) {

            heatmap.offset.left = col - Math.floor(x / ncz);
            heatmap.offset.top  = row - Math.floor(y / nrz);

            heatmap.cols.zoom = ncz;
            heatmap.rows.zoom = nrz;
            drawer.paint();
        }
    };

    var onGestureEnd = function (e) {
        e.preventDefault();

        col = Math.floor(x / heatmap.cols.zoom) + heatmap.offset.left;
        row = Math.floor(y / heatmap.rows.zoom) + heatmap.offset.top;

        var zoomin = e.originalEvent.scale > 1;

        var inc = 3;
        if (zoomin) {
            inc = Math.round(inc * e.originalEvent.scale * 0.75 );
        } else {
            inc = Math.round(inc * (1 / e.originalEvent.scale) * 0.75);
        }

        zoomHeatmap(inc, zoomin, col, row);

    };

    var onGestureChange = function (e) {
        e.preventDefault();

        return;
    };

    // Bind events
    this.canvas.bind('mousewheel', function (e, delta, deltaX, deltaY) {
        e.preventDefault();

        if (e.shiftKey) {
           // Zoom
	        var currentTime = new Date().getTime();
	        if ((currentTime - startWheel) > 500) {
	            var pos = eventTarget.offset();
	            x = (e.pageX - pos.left);
	            y = (e.pageY - pos.top);
	            col = Math.floor(x / heatmap.cols.zoom) + heatmap.offset.left;
	            row = Math.floor(y / heatmap.rows.zoom) + heatmap.offset.top;
	        }
	        startWheel = currentTime;

	        var zoomin = delta / 120 > 0;
	        zoomHeatmap(3, zoomin, col, row);

        } else {
             // Scroll rows

             // Normal speed
             var momentum = Math.round(heatmap.size.height / (7 * heatmap.rows.zoom));

             // Increase speed when user swipes the wheel (the increment depends on heatmap size).
             momentum = Math.abs(delta) > 1 ? Math.round(heatmap.rows.values.length / (20*Math.abs(delta))) : momentum;

             heatmap.offset.top = heatmap.offset.top - delta * momentum;

	         drawer.paint();

        }
    });
    this.canvas.bind('gesturechange', function (e) {
        onGestureChange(e);
    });
    this.canvas.bind('gestureend', function (e) {
        onGestureEnd(e);
    });
    this.canvas.bind('mousedown', function (e) {
        onMouseDown(e, e.pageX, e.pageY);
    });
    this.canvas.bind('touchstart', function(e) {
        onMouseDown(e, e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY);
    });

    this.canvas.bind('mousemove', function (e) {
        onMouseMove(e, e.pageX, e.pageY);
    });
    this.canvas.bind('touchmove', function(e) {
        onMouseMove(e, e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY);
    });

    this.canvas.bind('mouseup', function (e) {
        onMouseUp(e, e.pageX, e.pageY);
    });

    this.canvas.bind('touchend touchcancel', function (e) {
        if (downX && downY && (Math.abs(downX - lastX) < 10) && (Math.abs(downY - lastY) < 10))  {
            var pos = eventTarget.offset();
            onMouseUp(e, downX + pos.left, downY + pos.top);
        }
    });

};

jheatmap.components.CellBodyPanel.prototype.paint = function() {

    var heatmap = this.heatmap;
    var rz = heatmap.rows.zoom;
    var cz = heatmap.cols.zoom;
    var startRow = heatmap.offset.top;
    var endRow = heatmap.offset.bottom;
    var startCol = heatmap.offset.left;
    var endCol = heatmap.offset.right;

    var cellCtx = this.canvas.get()[0].getContext('2d');
    cellCtx.clearRect(0, 0, cellCtx.canvas.width, cellCtx.canvas.height)
    for (var row = startRow; row < endRow; row++) {

        for (var col = startCol; col < endCol; col++) {

            // Iterate all values
            var value = heatmap.cells.getValue(row, col, heatmap.cells.selectedValue);

            if (value != null) {
                var color = heatmap.cells.decorators[heatmap.cells.selectedValue].toColor(value);
                cellCtx.fillStyle = color;
                cellCtx.fillRect((col - startCol) * cz, (row - startRow) * rz, cz, rz);
            }
        }

        if ($.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1) {
            cellCtx.fillStyle = "rgba(0,0,0,0.1)";
            cellCtx.fillRect(0, (row - startRow) * rz, (endCol - startCol) * cz, rz);
            cellCtx.fillStyle = "white";
        }
    }

    // Selected columns
    for (var col = startCol; col < endCol; col++) {
        if ($.inArray(heatmap.cols.order[col], heatmap.cols.selected) > -1) {
            cellCtx.fillStyle = "rgba(0,0,0,0.1)";
            cellCtx.fillRect((col - startCol) * cz, 0, cz, (endRow - startRow) * rz);
            cellCtx.fillStyle = "white";
        }
    }

};