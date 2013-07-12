/**
 * Show hidden rows or columns action.
 *
 * @example
 * new jheatmap.actions.ClearSelection(heatmap);
 *
 * @param heatmap   The target heatmap
 * @class
 */
jheatmap.actions.ClearSelection = function (heatmap) {
    this.heatmap = heatmap;
    this.shortCut = "C";
    this.keyCodes = [99, 67];
    this.title = "Clear selection from rows/columns";
};

/**
 * Execute the action.
 * @private
 */
jheatmap.actions.ClearSelection.prototype.run = function (dimension) {
    dimension.selected = [];
    this.heatmap.drawer.paint();
};

jheatmap.actions.ClearSelection.prototype.rows = function() {
    this.run(this.heatmap.rows);
};

jheatmap.actions.ClearSelection.prototype.columns = function() {
    this.run(this.heatmap.cols);
};

