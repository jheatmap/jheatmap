var heatmapAggregators = {

	"default" : function(sum, value) {
		return sum + value;
	},

	"median" : function(sum, value) {
		
		var maxValue = 3;

		var distance = maxValue - Math.abs(value);
		distance = (distance < 0 ? 0 : distance);

		return sum + (value < 0 ? distance : (maxValue*2) - distance);
	},

	"pvalue" : function(sum, value) {
		var num = parseFloat(value);
		return sum + ((value >= 0.05) ? 0 : ((0.05 - value) / 0.05));
	}

};