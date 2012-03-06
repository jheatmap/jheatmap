var heatmapFilters = {
		
		'non-significant' : function(values, options) {
			for ( var i = 0; i < values.length; i++) {
				if (parseFloat(values[i]) < options.level) {
					return false;
				}
			}
			return true;
		},

		'non-expressed' : function(values, options) {
			for ( var i = 0; i < values.length; i++) {
				if (Math.abs(parseFloat(values[i])) > options.cutoff) {
					return false;
				}
			}
			return true;
		}

		
	};