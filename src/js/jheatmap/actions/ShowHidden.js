/**
 * Show hidden rows or columns action.
 *
 * @example
 * new jheatmap.actions.ShowHidden(heatmap);
 *
 * @param heatmap   The target heatmap
 * @class
 */
jheatmap.actions.ShowHidden = function (heatmap) {
    this.heatmap = heatmap;
    this.shortCut = "S";
    this.keyCodes = [83, 115];
    this.title = "Show hidden";
};

/**
 * Execute the action. *
 * @private
 */
jheatmap.actions.ShowHidden.prototype.run = function (dimension) {
    dimension.order = [];
    for (var c = 0; c < dimension.values.length; c++) {
        dimension.order[dimension.order.length] = c;
    }
};

jheatmap.actions.ShowHidden.prototype.rows = function() {
    this.run(this.heatmap.rows);
    this.heatmap.rows.sorter.sort(this.heatmap, "rows");
    this.heatmap.drawer.paint();
};

jheatmap.actions.ShowHidden.prototype.columns = function() {
    this.run(this.heatmap.cols);
    this.heatmap.cols.sorter.sort(this.heatmap, "columns");
    this.heatmap.drawer.paint();
};

