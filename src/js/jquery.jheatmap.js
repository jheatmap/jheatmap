var scripts = document.getElementsByTagName("script");
if (!basePath) {
    var basePath = scripts[scripts.length - 1].src.replace(/js\/jheatmap-(.*)\.js/g, "");
}
var console = console || {"log":function () {
}};

(function ($) {

    $.fn.heatmap = function (options) {

        return this.each(function () {

            options.container = $(this);
            var heatmap = new jheatmap.Heatmap(options);

            var initialize = function() {

                if (options.data.rows != undefined && heatmap.rows.ready == undefined) {
                    return;
                }

                if (options.data.cols != undefined && heatmap.cols.ready == undefined) {
                    return;
                }

                if (options.data.values != undefined && heatmap.cells.ready == undefined) {
                    return;
                }

                // Initialize heatmap
                heatmap.init();

            };

            if (options.data.rows != undefined) {
                options.data.rows.read(heatmap.rows, initialize);
            }

            if (options.data.cols != undefined) {
                options.data.cols.read(heatmap.cols, initialize);
            }

            if (options.data.values != undefined) {
                options.data.values.read(heatmap, initialize);
            }
        });
    };

})(jQuery);