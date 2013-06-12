/**
 * A text separated value file table reader
 *
 * @example
 * new jheatmap.readers.TsvTableReader({ url: "filename.tsv" });
 *
 * @class
 * @param {string}  p.url                 File url
 * @param {string} [p.separator="tab"]    Value separator character
 */
jheatmap.readers.TsvTableReader = function (p) {
    p = p || {};
    this.url = p.url || "";
    this.separator = p.separator || "\t";
};

/**
 * Asynchronously reads a text separated value file, the result is returned in the 'result' parameter.
 *
 * @param {Array} result.header Returns the file header as a string array.
 * @param {Array} result.values Returns the file values as an array of arrays.
 * @param {function}    initialize  A callback function that is called when the file is loaded.
 *
 */
jheatmap.readers.TsvTableReader.prototype.read = function (result, initialize) {

    var sep = this.separator;
    var url = this.url;

    jQuery.ajax({

        url: url,

        dataType: "text",

        success: function (file) {

            var lines = file.replace('\r', '').split('\n');
            jQuery.each(lines, function (lineCount, line) {
                if (line.length > 0 && !line.startsWith("#")) {
                    if (lineCount == 0) {
                        result.header = line.splitCSV(sep);
                    } else {
                        result.values[result.values.length] = line.splitCSV(sep);
                    }
                }
            });

            result.ready = true;

            initialize.call(this);

        }

    });
};