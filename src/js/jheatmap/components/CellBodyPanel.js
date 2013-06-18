
jheatmap.components.CellBodyPanel = function(drawer, heatmap) {
    this.heatmap = heatmap;

    // Create markup
    this.markup = $('<td>');
    this.canvas = $("<canvas width='" + heatmap.size.width + "' height='" + heatmap.size.height + "' tabindex='2'></canvas>");
    this.markup.append(this.canvas);

    // Events
    var downX = null;
    var downY = null;
    var lastX = null;
    var lastY = null;

    var onMouseUp = function (e) {
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

                var boxTop = e.pageY - $(heatmap.options.container).offset().top;
                var boxLeft = e.pageX - $(heatmap.options.container).offset().left;
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
                boxHeight = 70 + (heatmap.cells.header.length * 25);


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

    var onMouseMove = function (e) {
        e.preventDefault();

        if (downX != null) {
            var position = $(e.target).offset();
            var pX = e.pageX - position.left - lastX;
            var pY = e.pageY - position.top - lastY;

            var c = Math.round(pX / heatmap.cols.zoom);
            var r = Math.round(pY / heatmap.rows.zoom);

            if (!(r == 0 && c == 0)) {

                heatmap.offset.top -= r;
                heatmap.offset.left -= c;
                drawer.paint();
                lastX = e.pageX - position.left;
                lastY = e.pageY - position.top;
            }
        }

    };

    var onMouseDown = function (e) {
        e.preventDefault();

        var position = $(e.target).offset();
        downX = e.pageX - position.left;
        downY = e.pageY - position.top;
        lastX = downX;
        lastY = downY;

    };

    var col, row;
    var x, y;
    var startWheel = new Date().getTime();

    var zoomHeatmap = function (zoomin, col, row) {

        var ncz = null;
        var nrz = null;

        if (zoomin) {
            ncz = heatmap.cols.zoom + 3;
            nrz = heatmap.rows.zoom + 3;
        } else {
            ncz = heatmap.cols.zoom - 3;
            nrz = heatmap.rows.zoom - 3;
        }

        ncz = ncz < 3 ? 3 : ncz;
        ncz = ncz > 32 ? 32 : ncz;

        nrz = nrz < 3 ? 3 : nrz;
        nrz = nrz > 32 ? 32 : nrz;

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

        col = Math.round(heatmap.offset.left + ((heatmap.offset.right - heatmap.offset.left) / 2));
        row = Math.round(heatmap.offset.top + ((heatmap.offset.bottom - heatmap.offset.top) / 2));
        var zoomin = e.originalEvent.scale > 1;

        zoomHeatmap(zoomin, col, row);
    };

    var onGestureChange = function (e) {
        e.preventDefault();
    };

    var onMouseWheel = function (e, delta, deltaX, deltaY) {
        e.preventDefault();

        var currentTime = new Date().getTime();
        if ((currentTime - startWheel) > 500) {
            var pos = $(e.target).offset();
            x = (e.pageX - pos.left);
            y = (e.pageY - pos.top);
            col = Math.floor(x / heatmap.cols.zoom) + heatmap.offset.left;
            row = Math.floor(y / heatmap.rows.zoom) + heatmap.offset.top;
        }
        startWheel = currentTime;

        var zoomin = delta / 120 > 0;
        zoomHeatmap(zoomin, col, row);
    };

    // Bind events
    this.canvas.bind('mousewheel', function (e, delta, deltaX, deltaY) {
        onMouseWheel(e, delta, deltaX, deltaY);
    });
    this.canvas.bind('gesturechange', function (e) {
        onGestureChange(e);
    });
    this.canvas.bind('gestureend', function (e) {
        onGestureEnd(e);
    });
    this.canvas.bind('mousedown', function (e) {
        onMouseDown(e);
    });
    this.canvas.bind('mousemove', function (e) {
        onMouseMove(e);
    });
    this.canvas.bind('mouseup', function (e) {
        onMouseUp(e);
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