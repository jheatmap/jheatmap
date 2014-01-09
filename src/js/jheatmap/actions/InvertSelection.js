/**
 * Invert selection action.
 *
 * @example
 * new jheatmap.actions.InvertSelection(heatmap);
 *
 * @param heatmap   The target heatmap
 * @class
 */
jheatmap.actions.InvertSelection = function (heatmap) {
    this.heatmap = heatmap;
    this.shortCut = "H";
    this.keyCodes = [72, 104];
    this.title = "Invert selection";
    this.icon = "fa-exchange";
};

/**
 * Execute the action.
 * @private
 */
jheatmap.actions.InvertSelection.prototype.run = function (dimension) {
    if (dimension.selected.length > 0) {
        newSelection = $.grep(dimension.order, function (value) {
                return dimension.selected.indexOf(value) == -1;
        });
        dimension.selected = newSelection;
        this.heatmap.drawer.paint();
    }
};

jheatmap.actions.InvertSelection.prototype.rows = function() {
    this.run(this.heatmap.rows);
};

jheatmap.actions.InvertSelection.prototype.columns = function() {
    this.run(this.heatmap.cols);
};

