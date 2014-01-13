/**
 * Copy to clipboard selected labels.
 *
 * @example
 * new jheatmap.actions.CopyToClipboard();
 *
 * @param heatmap   The target heatmap
 * @class
 */
jheatmap.actions.CopyToClipboard = function (heatmap) {
    this.heatmap = heatmap;
    this.title = "Copy to clipboard";
    this.icon = "fa-clipboard";
};

/**
 * Execute the action. *
 * @private
 */
jheatmap.actions.CopyToClipboard.prototype.run = function (dimension) {
    if (dimension.selected.length > 0) {

        text = "";
        i = 0;
        while (i < dimension.selected.length) {
            var value = dimension.values[dimension.selected[i]][dimension.selectedValue];
            text = text + value;
            i++;
            if (i < dimension.selected.length) {
               text = text + ", ";
            }
        }

        window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
    }
};

jheatmap.actions.CopyToClipboard.prototype.rows = function() {
    this.run(this.heatmap.rows);
};

jheatmap.actions.CopyToClipboard.prototype.columns = function() {
    this.run(this.heatmap.cols);
};

