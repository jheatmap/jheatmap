/**
 * A text separated value GenePattern GCT file matrix reader. The file has to follow this format:
 *
 * <pre><code>
 *    #1.2
 *   Name  Description      col1    col2
 *   row1  row1desc		 	0.11    0.12
 *   row2   row2desc 		0.21    0.22
 * </code></pre>
 *
 * @example
 * new jheatmap.readers.GctHeatmapReader({ url: "filename.gct" });
 *
 * @author Ted Liefeld
 * @class
 * @param {string}  p.url                 File url
 *
 */
jheatmap.readers.GctHeatmapReader = function (p) {
    p = p || {};
    this.url = p.url || "";
    this.separator = p.separator || "\t";
    this.colAnnotationUrl = p.colAnnotationUrl || null;

};

/**
 * Asynchronously reads a text separated value file, the result is loaded in the 'heatmap' parameter.
 *
 * @param {jheatmap.Heatmap}     heatmap     The destination heatmap.
 * @param {function}    initialize  A callback function that is called when the file is loaded.
 *
 */
jheatmap.readers.GctHeatmapReader.prototype.read = function (heatmap, initialize) {

    var sep = this.separator;
    var url = this.url;
    var colAnnotationUrl = this.colAnnotationUrl;

    jQuery.ajax({
        url: url,
        dataType: "text",
        success: function (file) {

            var lines = file.replace('\r', '').split('\n');
            jQuery.each(lines, function (lineCount, line) {
                if (line.length > 0 && !line.startsWith("#")) {
                    if (lineCount < 2) {
                        // skip lines 1,2 with the gct header
                    } else if (lineCount == 2) {
                        var headerLine = line.splitCSV(sep);
                        headerLine.shift();
                        headerLine.shift();
                        heatmap.cells.header = headerLine;
                    } else {
                        var valLine = line.splitCSV(sep);
                        heatmap.cells.values[heatmap.cells.values.length] = valLine;
                    }
                }
            });

            heatmap.cols.header = [ "Samples" ];
            for (var i = 0; i < heatmap.cells.header.length; i++) {
                heatmap.cols.values[heatmap.cols.values.length] = [ heatmap.cells.header[i] ];
            }

            var cellValues = [];
            heatmap.rows.header = [ "Feature Name", "Description" ];
            for (var row = 0; row < heatmap.cells.values.length; row++) {
                heatmap.rows.values[heatmap.rows.values.length] = [ heatmap.cells.values[row][0],  heatmap.cells.values[row][1]];
                for (var col = 0; col < heatmap.cols.values.length; col++) {
                    cellValues[cellValues.length] = [ heatmap.cells.values[row][col + 2] ];
                }
            }

            delete heatmap.cells.header;
            delete heatmap.cells.values;
            heatmap.cells.header = [ "Value" ];
            heatmap.cells.values = cellValues;

            if (colAnnotationUrl != null){
                jQuery.ajax({
                    url: colAnnotationUrl,
                    dataType: "text",
                    success: function (file) {

                        var colHash = {};
                        for (var i = 0; i < heatmap.cols.values.length; i++) {
                            colHash[(heatmap.cols.values[i][0]).toString()] = i;
                        }

                        var lines = file.replace('\r', '').split('\n');
                        heatmap.cols.header = lines[0].split('\t');
                        for (var i = 1; i < lines.length; i++) {
                            var values = lines[i].split('\t');
                            var pos = colHash[values[0]];
                            if (pos != undefined) {
                                heatmap.cols.values[pos] = values;
                            }
                        }
                        heatmap.cells.ready = true;
                        initialize.call(this);
                    }
                });

            } else {
                heatmap.cells.ready = true;
                initialize.call(this);
            }
        }
    });
};