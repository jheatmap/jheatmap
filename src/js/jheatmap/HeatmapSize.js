/**
 *
 * Heatmap size
 *
 * @class
 */
jheatmap.HeatmapSize = function (heatmap) {


    /**
     * Heatmap width in pixels
     *
     * @type {number}
     */
    this.width = 400;

    /**
     * Header of the items values
     *
     * @type {number}
     */
    this.height = 400;


    this.heatmap = heatmap;

};

jheatmap.HeatmapSize.prototype.init = function () {

    var top = this.heatmap.options.container.offset().top;
    this.heatmap.options.container.css("overflow", "hidden");
    var wHeight = $(window).height();

    this.width = this.heatmap.options.container.width() - 290;
    this.height = wHeight - top - 291;

    // Check a minimum width
    if (this.width < 100) {
        this.width = 200;
    }

    // Check a maximum width
    var maxWidth = (this.heatmap.cols.values.length * this.heatmap.cols.zoom);
    if (this.width > maxWidth) {
        this.width = maxWidth;
    }

    // Check minimum height
    if (this.height < 100) {
        if (wHeight > 500) {
            this.height = wHeight - 250;
        } else {
            this.height = 200;
        }
    }

    // Check maximum height
    var maxHeight = (this.heatmap.rows.values.length * this.heatmap.rows.zoom);
    if (this.height > maxHeight) {
        this.height = maxHeight;
    }
};