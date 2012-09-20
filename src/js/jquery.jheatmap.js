var scripts = document.getElementsByTagName("script");
if (!basePath) {
    var basePath = scripts[scripts.length - 1].src.replace(/js\/jheatmap-(.*)\.js/g, "");
}
var console = console || {"log":function () {
}};

(function ($) {

    String.prototype.splitCSV = function (sep) {
        for (var thisCSV = this.split(sep = sep || ","), x = thisCSV.length - 1, tl; x >= 0; x--) {
            if (thisCSV[x].replace(/"\s+$/, '"').charAt(thisCSV[x].length - 1) == '"') {
                if ((tl = thisCSV[x].replace(/^\s+"/, '"')).length > 1 && tl.charAt(0) == '"') {
                    thisCSV[x] = thisCSV[x].replace(/^\s*"|"\s*$/g, '').replace(/""/g, '"');
                } else if (x) {
                    thisCSV.splice(x - 1, 2, [ thisCSV[x - 1], thisCSV[x] ].join(sep));
                } else
                    thisCSV = thisCSV.shift().split(sep).concat(thisCSV);
            } else
                thisCSV[x].replace(/""/g, '"');
        }
        return thisCSV;
    };

    String.prototype.startsWith = function (str) {
        return (this.match("^" + str) == str);
    };

    var data;

    var methods = {

        // Load one file.
        readfile:function (csvFile, sep, result, parse, options, obj) {
            $.ajax({
                url:csvFile,
                success:function (file) {
                    var lines = file.replace('\r', '').split('\n');
                    $.each(lines, function (lineCount, line) {
                        if (line.length > 0 && !line.startsWith("#")) {
                            if (lineCount == 0) {
                                result.header = line.splitCSV(sep);
                            } else {
                                var valuesRow = [];
                                if (parse) {
                                    var textValues = line.splitCSV(sep);
                                    for (var i = 0; i < textValues.length; i++) {
                                        valuesRow[valuesRow.length] = parseFloat(textValues[i]);
                                    }
                                } else {
                                    valuesRow = line.splitCSV(sep);
                                }
                                result.values[result.values.length] = valuesRow;
                            }
                        }
                    });
                    if (options != undefined) {

                        data.loading(function () {

                            // Two columns matrix format
                            if (options.data.type == "tdm") {

                                var cellValues = [];

                                // Try to deduce with column is the row primary key.
                                var rowKey;
                                var valuesRowKey;
                                if (options.data.rows != undefined) {
                                    for (var i = 0; i < data.rows.header.length; i++) {
                                        if ((valuesRowKey = $.inArray(data.rows.header[i], data.cells.header)) > -1) {
                                            rowKey = i;
                                            break;
                                        }
                                    }
                                } else {
                                    rowKey = 0;

                                    if (options.data.rows_annotations != undefined) {
                                        var rowAnn = options.data.rows_annotations;

                                        valuesRowKey = rowAnn[0];
                                        data.rows.header = [];

                                        for (var i = 0; i < rowAnn.length; i++) {
                                            data.rows.header.push(data.cells.header[rowAnn[i]]);
                                            data.cells.header[rowAnn[i]] = undefined;
                                        }
                                    } else {
                                        valuesRowKey = 1;
                                        data.rows.header = [ data.cells.header[ valuesRowKey ] ];
                                    }
                                }

                                // Try to deduce with column is the column primary
                                // key.
                                var colKey;
                                var valuesColKey;

                                if (options.data.cols != undefined) {
                                    for (var i = 0; i < data.cols.header.length; i++) {
                                        if ((valuesColKey = $.inArray(data.cols.header[i], data.cells.header)) > -1) {
                                            if (valuesColKey != valuesRowKey) {
                                                colKey = i;
                                                break;
                                            }
                                        }
                                    }
                                } else {
                                    colKey = 0;

                                    if (options.data.cols_annotations != undefined) {
                                        var colAnn = options.data.cols_annotations;

                                        valuesColKey = colAnn[0];
                                        data.cols.header = [];

                                        for (var i = 0; i < colAnn.length; i++) {
                                            data.cols.header.push(data.cells.header[colAnn[i]]);
                                            data.cells.header[colAnn[i]] = undefined;
                                        }

                                    } else {
                                        valuesColKey = 0;
                                        data.cols.header = [ data.cells.header[ valuesColKey ]];
                                    }
                                }

                                // Build hashes
                                var rowHash = {};
                                var colHash = {};

                                if (options.data.rows != undefined && options.data.cols != undefined) {

                                    for (var i = 0; i < data.rows.values.length; i++) {
                                        rowHash[(data.rows.values[i][rowKey]).toString()] = i;
                                    }

                                    for (var i = 0; i < data.cols.values.length; i++) {
                                        colHash[(data.cols.values[i][colKey]).toString()] = i;
                                    }

                                } else {
                                    console.log((new Date().getTime()) + " Building columns and rows hashes...");
                                    for (var i = 0; i < data.cells.values.length; i++) {
                                        var values = data.cells.values[i];

                                        if (values != null) {
                                            var rowValues;
                                            if (options.data.rows_annotations != undefined) {
                                                rowValues = options.data.rows_annotations;
                                            } else {
                                                rowValues = [ valuesRowKey ];
                                            }
                                            if (rowHash[(values[valuesRowKey]).toString()] == undefined) {

                                                var pos = data.rows.values.length;
                                                rowHash[(values[valuesRowKey]).toString()] = pos;
                                                data.rows.values[pos] = [];

                                                for (var r = 0; r < rowValues.length; r++) {
                                                    data.rows.values[pos][r] = values[rowValues[r]];
                                                }
                                            }

                                            var colValues;
                                            if (options.data.cols_annotations != undefined) {
                                                colValues = options.data.cols_annotations;
                                            } else {
                                                colValues = [ valuesColKey ];
                                            }
                                            if (colHash[(values[valuesColKey]).toString()] == undefined) {
                                                var pos = data.cols.values.length;
                                                colHash[(values[valuesColKey]).toString()] = pos;
                                                data.cols.values[pos] = [];

                                                for (var c = 0; c < colValues.length; c++) {
                                                    data.cols.values[pos][c] = values[colValues[c]];
                                                }
                                            }
                                        }
                                    }
                                    console.log((new Date().getTime()) + " Hashes ready");
                                }

                                // Create a null matrix
                                var totalPos = data.rows.values.length * data.cols.values.length;
                                for (var pos = 0; pos < totalPos; pos++) {
                                    cellValues[pos] = null;
                                }

                                var cl = data.cols.values.length;

                                console.log((new Date().getTime()) + " Loading cell values...");
                                for (var i = 0; i < data.cells.values.length; i++) {

                                    var value = data.cells.values[i];

                                    if (value != null) {
                                        var rowIndex = rowHash[value[valuesRowKey]];
                                        var colIndex = colHash[value[valuesColKey]];

                                        var pos = rowIndex * cl + colIndex;

                                        cellValues[pos] = value;
                                    }
                                }
                                console.log((new Date().getTime()) + " Cells ready");

                                delete data.cells.values;
                                data.cells.values = cellValues;

                                // Continuous data matrix format
                            } else if (options.data.type == "cdm") {

                                data.cols.header = [ "Column" ];
                                for (var i = 0; i < data.cells.header.length; i++) {
                                    data.cols.values[data.cols.values.length] = [ data.cells.header[i] ];
                                }

                                var cellValues = [];
                                data.rows.header = [ "Row" ];
                                for (var row = 0; row < data.cells.values.length; row++) {
                                    data.rows.values[data.rows.values.length] = [ data.cells.values[row][0] ];
                                    for (var col = 0; col < data.cols.values.length; col++) {
                                        cellValues[cellValues.length] = [ data.cells.values[row][col + 1] ];
                                    }
                                }

                                delete data.cells.header;
                                delete data.cells.values;
                                data.cells.header = [ "Value" ];
                                data.cells.values = cellValues;
                            }

                            // Reset orders
                            data.init(obj);

                            // Call init function
                            options.init.call(this, data);

                            // Paint the heatmap
                            data.build();
                            data.paint();
                            data.sync = true;

                        });
                    };

                },
                dataType:"text"
            });
        },

        // Load all the data files.
        load:function (data, options, obj) {

            if (options.data.rows != undefined) {
                methods['readfile'].call(this, options.data.rows, options.separator, data.rows, false, options, obj);
            }

            if (options.data.cols != undefined) {
                methods['readfile'].call(this, options.data.cols, options.separator, data.cols, false, options, obj);
            }

            if (options.data.values != undefined) {
                methods['readfile'].call(this, options.data.values, options.separator, data.cells, false, options, obj);
            }

        },

        init:function (options) {
            var obj = $(this);

            // Load all the data files on init
            data.loading(function () {
                methods['load'].call(this, data, options, obj);
            });

        }

    };


    $.fn.heatmap = function (options) {
        var defaults = {
            separator:"\t",
            data:{
                type:"raw",
                rows:"heatmap-rows.tsv",
                cols:"heatmap-cols.tsv",
                values:"heatmap-values.tsv"
            },
            init:function (heatmap) {
            }
        };
        var options = $.extend(defaults, options);
        data = new jheatmap.Heatmap();
        data.sync = true;

        return this.each(methods['init'].call(this, options));
    };

})(jQuery);