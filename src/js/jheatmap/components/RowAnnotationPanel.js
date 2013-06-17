
jheatmap.components.RowAnnotationPanel = function(drawer, heatmap) {

    this.heatmap = heatmap;
    this.span = (heatmap.cols.annotations.length > 0 ? 2 : 1);
    this.visible = (heatmap.rows.annotations.length > 0);

    // Create markup
    this.header = $("<th>", {'class': 'border-rows-ann','rowspan': this.span });
    this.headerCanvas = $("<canvas class='header' width='" + 10 * heatmap.rows.annotations.length + "' height='150'></canvas>");
    this.header.append(this.headerCanvas);

    this.body = $("<td class='borderL'>");
    this.bodyCanvas = $("<canvas width='" + heatmap.rows.annotations.length * 10 + "' height='" + heatmap.size.height + "'></canvas>");
    this.body.append(this.bodyCanvas);

    // Bind events
    this.bodyCanvas.click(function (e) {

        var position = $(e.target).offset();
        var row = Math.floor((e.originalEvent.pageY - position.top) / heatmap.rows.zoom) + heatmap.offset.top;

        var details = $('table.heatmap div.detailsbox');
        var boxTop = e.pageY - $(heatmap.options.container).offset().top;
        var boxLeft = e.pageX - $(heatmap.options.container).offset().left;
        var boxWidth;
        var boxHeight;

        var boxHtml = "<dl class='dl-horizontal'>";

        for (var i = 0; i < heatmap.rows.annotations.length; i++) {
            var field = heatmap.rows.annotations[i];
            boxHtml += "<dt>" + heatmap.rows.header[field] + ":</dt><dd>";
            var val = heatmap.rows.getValue(row, field);
            if (!isNaN(val) && (val % 1 != 0)) {
                val = Number(val).toFixed(3);
            }
            boxHtml += val;
            boxHtml += "</dd>";
        }
        boxHtml += "</dl>";

        details.html(boxHtml);
        boxWidth = 300;
        boxHeight = 26 + heatmap.rows.annotations.length * 22;

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



    });


    this.headerCanvas.click(function (e) {
        var pos = $(e.target).offset();
        var i = Math.floor((e.pageX - pos.left) / 10);

        heatmap.rows.sorter = new jheatmap.sorters.AnnotationSorter(heatmap.rows.annotations[i], !(heatmap.rows.sorter.asc));
        heatmap.rows.sorter.sort(heatmap, "rows");
        drawer.paint();
    });

};

jheatmap.components.RowAnnotationPanel.prototype.paint = function() {

    if (this.visible) {

        var heatmap = this.heatmap;
        var rz = heatmap.rows.zoom;
        var startRow = heatmap.offset.top;
        var endRow = heatmap.offset.bottom;

        var textSpacing = 5;
        var annRowHeadCtx = this.headerCanvas.get()[0].getContext('2d');
        
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

        var rowsAnnValuesCtx = this.bodyCanvas.get()[0].getContext('2d');
        rowsAnnValuesCtx.clearRect(0, 0, rowsAnnValuesCtx.canvas.width, rowsAnnValuesCtx.canvas.height);
        for (var row = startRow; row < endRow; row++) {

            for (var i = 0; i < heatmap.rows.annotations.length; i++) {
                var field = heatmap.rows.annotations[i];
                var value = heatmap.rows.getValue(row, field);

                if (value != null) {
                    rowsAnnValuesCtx.fillStyle = heatmap.rows.decorators[field].toColor(value);
                    rowsAnnValuesCtx.fillRect(i * 10, (row - startRow) * rz, 10, rz);
                }

            }

            if ($.inArray(heatmap.rows.order[row], heatmap.rows.selected) > -1) {
                rowsAnnValuesCtx.fillStyle = "rgba(0,0,0,0.1)";
                rowsAnnValuesCtx.fillRect(0, (row - startRow) * rz, heatmap.rows.annotations.length * 10, rz);
                rowsAnnValuesCtx.fillStyle = "white";
            }
        }
    }
};