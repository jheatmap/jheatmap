/**
 * Hide selected action.
 *
 * @example
 * new jheatmap.actions.HideSelected(heatmap);
 *
 * @param heatmap   The target heatmap
 * @class
 */
jheatmap.actions.HideSelected = function (heatmap) {
    this.heatmap = heatmap;
    this.shortCut = "H";
    this.keyCodes = [72, 104];
    this.title = "Hide selected rows/columns";
};

/**
 * Execute the action. *
 * @private
 */
jheatmap.actions.HideSelected.prototype.run = function (dimension) {
    if (dimension.selected.length > 0) {
        dimension.order = $.grep(dimension.order, function (value) {
                return dimension.selected.indexOf(value) == -1;
        });
        this.heatmap.drawer.paint();
    }
};

jheatmap.actions.HideSelected.prototype.rows = function() {
    this.run(this.heatmap.rows);
};

jheatmap.actions.HideSelected.prototype.columns = function() {
    this.run(this.heatmap.cols);
};

