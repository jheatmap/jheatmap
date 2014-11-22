var jheatmap = require("jheatmap");
$('#heatmap').heatmap(
  {
  data : {
    rows: new jheatmap.readers.AnnotationReader({ url: "./tcgagbm/tcga-gbm-rows.tsv" }),
    cols: new jheatmap.readers.AnnotationReader({ url: "./tcgagbm/tcga-gbm-cols.tsv" }),
    values: new jheatmap.readers.TableHeatmapReader({ url: "./tcgagbm/tcga-gbm-data.tsv"})
  },
  init : function(heatmap) {

    // Default cell value
    heatmap.cells.selectedValue = "Genomic Alterations";
    heatmap.rows.selectedValue = "symbol";

    // Setup default zoom & size
    heatmap.cols.zoom = 1;
    heatmap.rows.zoom = 15;
    heatmap.cols.labelSize = 170;

    // Configure decorators and aggregators
    heatmap.cells.decorators["Genomic Alterations"] = new jheatmap.decorators.Categorical({
      values: ["Mut","Gain","Loss", "Mut+Gain", "Mut+Loss"], colors : ["green","red","blue", "DarkRed", "DarkBlue"] });
      heatmap.cells.aggregators["Genomic Alterations"] = new jheatmap.aggregators.BinaryStringAddition();
      heatmap.cells.decorators["Mutation"] = new jheatmap.decorators.Categorical({
        values: ["0","1"], colors : ["white","green"] });
        heatmap.cells.aggregators["Mutation"] = new
        jheatmap.aggregators.AbsoluteAddition();
        heatmap.cells.decorators["CNA Status"] = new jheatmap.decorators.Categorical({
          values: ["-2","2"], colors : ["blue","red"] });
          heatmap.cells.aggregators["CNA Status"] = new jheatmap.aggregators.AbsoluteAddition();

          heatmap.cells.decorators["Expression"] = new jheatmap.decorators.Heat({
            minValue: -2, midValue: 0, maxValue: 2, minColor: [85, 0, 136], nullColor: [255,255,255], maxColor: [255, 204, 0], midColor: [240,240,240] });
            heatmap.cells.aggregators["Expression"] = new jheatmap.aggregators.Median();

            // Col annotations
            heatmap.cols.decorators["subtype"] = new jheatmap.decorators.CategoricalRandom();
            heatmap.cols.annotations = ["subtype"];
            heatmap.cols.annotationSize = 30;

            // Row annotations
            heatmap.rows.decorators["fm-bias"] = new jheatmap.decorators.PValue({
              cutoff: 0.05 });
              heatmap.rows.decorators["mut-freq"] = new jheatmap.decorators.Linear({
                ranges: [[0,1]], colors: [[[255,255,255],[255,0,255]]] });
                heatmap.rows.decorators["clust-bias"] = new jheatmap.decorators.PValue({
                  cutoff: 0.05 });
                  heatmap.rows.annotations = ["fm-bias","mut-freq","clust-bias"];

                  // Add mutually exclusive action
                  heatmap.actions.splice(6,0,new jheatmap.actions.MutualExclusiveSort(heatmap));

  }

}
);
