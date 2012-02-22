function RGBColor(r, g, b) {

		// Init values;
		this.r = r;
		this.g = g;
		this.b = b;

		// Validate values
		this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
		this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
		this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);

		this.toHex = function() {
			var r = this.r.toString(16);
			var g = this.g.toString(16);
			var b = this.b.toString(16);
			if (r.length == 1)
				r = '0' + r;
			if (g.length == 1)
				g = '0' + g;
			if (b.length == 1)
				b = '0' + b;
			return '#' + r + g + b;
		};

		this.toRGB = function() {
			return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
		};

	}

var heatmapDecorators = {
			
		"empty" : function(value) {
			return "white";
		},
				
		"test" : function(value) {
			var color;
			if (value == 1) {
				color = 'blue';
			} else if (value == 2) {
				color = 'red';
			} else if (value == 3) {
				color = 'green';
			}
			
			return color;
		},
		
		"sex" : function(value) {
			var color = "white";
			if (value == "F") {
				color = "pink"; 
			} else if ( value == "M" ) {
				color = "blue";
			}
			
			return color;
		},
		
		"median" : function(value) {
			var r, g, b;
			
			var maxValue = 3;
			
			if (isNaN(value)) {
				r = 255;
				g = 255;
				b = 255;
			} else if (value < 0){
				value = Math.abs(value);
				value = (value > maxValue ? maxValue : value);
				g = (value == 0) ? 255 : (255 - Math.round((value / maxValue) * 255));
				r = 85 + Math.round((g / 255) * 170);
				b = 136 + Math.round((g / 255) * 119);
			} else {
				r = 255;
				value = (value > maxValue ? maxValue : value);
				b = (value == 0) ? 255 : (255 - Math.round((value / maxValue) * 255));
				g = 204 + Math.round((b / 255) * 51);
			}
						
			var color = (new RGBColor(r, g, b)).toRGB();
			return color;
		},

		"pvalue" : function(value) {

			var r, g, b;

			if (isNaN(value)) {
				r = 255;
				g = 255;
				b = 255;
			} else if (value > 0.05) {
				r = 187;
				g = 187;
				b = 187;
			} else {
				r = 255;
				g = (value == 0) ? 0 : Math.round((value / 0.05) * 255);
				b = 0;
			}
			var color = (new RGBColor(r, g, b)).toRGB();

			return color;
		}
	};