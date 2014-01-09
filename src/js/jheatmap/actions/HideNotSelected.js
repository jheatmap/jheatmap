/**
 * Hide not selected action.
 *
 * @example
 * new jheatmap.actions.HideNotSelected(heatmap);
 *
 * @param heatmap   The target heatmap
 * @class
 */
jheatmap.actions.HideNotSelected = function (heatmap) {
    this.heatmap = heatmap;
    this.shortCut = "H";
    this.keyCodes = [72, 104];
    this.title = "Hide NOT selected";
    this.icon = "fa-eye-slash";
};

/**
 * Execute the action. *
 * @private
 */
jheatmap.actions.HideNotSelected.prototype.run = function (dimension) {
    if (dimension.selected.length > 0) {
        dimension.order = $.grep(dimension.order, function (value) {
                return dimension.selected.indexOf(value) != -1;
        });
        this.heatmap.drawer.paint();
    }
};

jheatmap.actions.HideNotSelected.prototype.rows = function() {
    this.run(this.heatmap.rows);
};

jheatmap.actions.HideNotSelected.prototype.columns = function() {
    this.run(this.heatmap.cols);
};

