
jheatmap.components.HorizontalScrollBar = function(drawer, heatmap) {

    this.heatmap = heatmap;

    // Create markup
    this.markup = $("<td class='borderT'>");
    this.canvas = $("<canvas class='header' width='" + heatmap.size.width + "' height='10'></canvas>");
    this.markup.append(this.canvas);
    this.canvas.bind('contextmenu', function(e){
        return false;
    });

    // Events
    var hScrollMouseDown = false;

    var onScrollClick = function (e) {
        var maxWidth = (heatmap.offset.right - heatmap.offset.left) * heatmap.cols.zoom;
        var iniX = Math.round(maxWidth * (heatmap.offset.left / heatmap.cols.order.length));
        var endX = Math.round(maxWidth * (heatmap.offset.right / heatmap.cols.order.length));
        var pX = e.pageX - $(e.target).offset().left - ((endX - iniX) / 2);
        pX = (pX < 0 ? 0 : pX);
        heatmap.offset.left = Math.round((pX / maxWidth) * heatmap.cols.order.length);
        drawer.paint();
    };

    var onScrollMouseDown = function (e) {
        e.preventDefault();

        hScrollMouseDown = true;
    };

    var onScrollMouseUp = function (e) {
        e.preventDefault();

        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
            return;
        }

        hScrollMouseDown = false;
        drawer.paint();
    };

	var scrollTarget = this.canvas;
    var onScrollMouseMove = function (e) {

        if (hScrollMouseDown) {
            var maxWidth = (heatmap.offset.right - heatmap.offset.left) * heatmap.cols.zoom;
            var iniX = Math.round(maxWidth * (heatmap.offset.left / heatmap.cols.order.length));
            var endX = Math.round(maxWidth * (heatmap.offset.right / heatmap.cols.order.length));
            var pX = e.pageX - scrollTarget.offset().left - ((endX - iniX) / 2);
            pX = (pX < 0 ? 0 : pX);
            heatmap.offset.left = Math.round((pX / maxWidth) * heatmap.cols.order.length);
            drawer.paint();
        }
    };


    // Bind events
    this.canvas.bind('click', function (e) {
        onScrollClick(e);
    });
    this.canvas.bind('mousedown', function (e) {
        onScrollMouseDown(e);
    });
    $(document).bind('mouseup', function (e) {
        onScrollMouseUp(e);
    });
    $(document).bind('mousemove', function (e) {
        onScrollMouseMove(e);
    });

};

jheatmap.components.HorizontalScrollBar.prototype.paint = function() {

    var heatmap = this.heatmap;

    var startCol = heatmap.offset.left;
    var endCol = heatmap.offset.right;

    var scrollHorCtx = this.canvas.get()[0].getContext('2d');
    scrollHorCtx.clearRect(0, 0, scrollHorCtx.canvas.width, scrollHorCtx.canvas.height)
    scrollHorCtx.fillStyle = "rgba(0,136,204,1)";
    var maxWidth = (endCol - startCol) * heatmap.cols.zoom;
    var iniX = Math.round(maxWidth * (startCol / heatmap.cols.order.length));
    var endX = Math.round(maxWidth * (endCol / heatmap.cols.order.length));
    scrollHorCtx.fillRect(iniX, 0, endX - iniX, 10);

};