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

    var data = new jheatmap.Heatmap();

    var methods = {

        // Load one file.
        readfile:function (csvFile, sep, result, parse) {
            $.ajax({
                url:csvFile,
                success:function (data) {
                    var lines = data.replace('\r', '').split('\n');
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
                },
                dataType:"text"
            });
        },

        // Load all the data files.
        load:function (data, options) {
            data.sync = false;

            if (options.data.rows != undefined) {
                methods['readfile'].call(this, options.data.rows, options.separator, data.rows, false);
            }

            if (options.data.cols != undefined) {
                methods['readfile'].call(this, options.data.cols, options.separator, data.cols, false);
            }

            if (options.data.values != undefined) {
                methods['readfile'].call(this, options.data.values, options.separator, data.cells, false);
            }

        },

        init:function (options) {
            var obj = $(this);

            data.paint(obj);

            obj.ajaxStop(function () {
                if (!data.sync) {

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
                                valuesRowKey = 1;
                                data.rows.header = [ data.cells.header[ valuesRowKey ] ];
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
                                valuesColKey = 0;
                                data.cols.header = [ data.cells.header[ valuesColKey ]];
                            }

                            // Build hashes
                            var rowHash = {};
                            if (options.data.rows != undefined) {
                                for (var i = 0; i < data.rows.values.length; i++) {
                                    rowHash[(data.rows.values[i][rowKey]).toString()] = i;
                                }
                            } else {
                                for (var i = 0; i < data.cells.values.length; i++) {
                                    var value = data.cells.values[i][valuesRowKey];
                                    if (rowHash[(value).toString()] == undefined) {
                                        rowHash[(value).toString()] = data.rows.values.length;
                                        data.rows.values[data.rows.values.length] = [ value ];
                                    }
                                }
                            }

                            var colHash = {};
                            if (options.data.cols != undefined) {
                                for (var i = 0; i < data.cols.values.length; i++) {
                                    colHash[(data.cols.values[i][colKey]).toString()] = i;
                                }
                            } else {
                                for (var i = 0; i < data.cells.values.length; i++) {
                                    var value = data.cells.values[i][valuesColKey];
                                    if (colHash[(value).toString()] == undefined) {
                                        colHash[(value).toString()] = data.cols.values.length;
                                        data.cols.values[data.cols.values.length] = [ value ];
                                    }
                                }
                            }

                            // Create a null matrix
                            var totalPos = data.rows.values.length * data.cols.values.length;
                            for (var pos = 0; pos < totalPos; pos++) {
                                cellValues[pos] = null;
                            }

                            var cl = data.cols.values.length;
                            for (var i = 0; i < data.cells.values.length; i++) {

                                var value = data.cells.values[i];

                                if (value != null) {
                                    var rowIndex = rowHash[value[valuesRowKey]];
                                    var colIndex = colHash[value[valuesColKey]];

                                    var pos = rowIndex * cl + colIndex;

                                    cellValues[pos] = value;
                                }
                            }

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
                        data.init();

                        // Call init function
                        options.init.call(this, data);

                        // Paint the heatmap
                        data.paint(obj);
                        data.sync = true;

                    });
                }

            });


            // Load all the data files on init
            data.loading( function() {
                methods['load'].call(this, data, options);
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
        return this.each(methods['init'].call(this, options));
    };

})(jQuery);