/**
 * Author: Jordi Deu-Pons
 * 
 * Credit to jquerycsvtotable. http://code.google.com/p/jquerycsvtotable/
 * splitCSV: credit goes to Brian Huisman. http://www.greywyvern.com/?post=258
 */

var scripts = document.getElementsByTagName("script");

if (!basePath) {
	var basePath = scripts[scripts.length - 1].src.replace(/js\/jheatmap-(.*)\.js/g, "");
}

var console=console||{"log":function(){}};

(function($) {
	
	function Heatmap() {

		this.tooltip = true;

		this.size = {
			width : 800,
			height : 800
		},

		this.offset = {
			top : 0,
			left : 0
		},

		this.sync = false;

		this.filters = {};
		
		this.search = null;

		this.rows = {
			zoom : 20,
			header : [],
			values : [],
			order : [],
			selectedValue : 0,
			sort : {
				type : "none",
				field : 0,
				asc : false
			},
			filters : [],
			decorators : [],
			annotations : [],
			selected : []
		};
		this.cols = {
			zoom : 20,
			header : [],
			values : [],
			order : [],
			selectedValue : 0,
			sort : {
				type : "none",
				field : 0,
				asc : false
			},
			decorators : [],
			annotations : [],
			selected : []
		};
		this.cells = {
			header : [],
			values : [],
			selectedValue : 0,
			decorators : [],
			aggregators : []
		};

		this.getRowsFilter = function(filterId) {
			var filter = this.rows.filters[this.cells.selectedValue];

			if (filter) {
				return filter[filterId];
			}

			return filter;
		};

		this.addRowsFilter = function(filterId) {

			var currentField = this.cells.selectedValue;
			if (!this.rows.filters[currentField]) {
				this.rows.filters[currentField] = {};
			}

			this.rows.filters[currentField][filterId] = this.filters[filterId];
		};

		this.removeRowsFilter = function(filterId) {
			delete this.rows.filters[this.cells.selectedValue][filterId];
		};

		this.applyRowsFilters = function() {

			// Initialize rows order
			this.rows.order = [];

			if (this.rows.filters.length == 0) {

				this.rows.order = [];
				for ( var r = 0; r < this.rows.values.length; r++) {
					this.rows.order[this.rows.order.length] = r;
				}
				return;
			}

			var cl = this.cols.values.length;

			nextRow: for ( var r = 0; r < this.rows.values.length; r++) {

				for ( var field = 0; field < this.cells.header.length; field++) {

					// Get all column values
					var values = [];
					for ( var c = 0; c < this.cols.values.length; c++) {
						var pos = r * cl + c;
						values[values.length] = this.cells.values[pos][field];
					}

					// Filters
					var filters = this.rows.filters[field];
					for ( var filterId in filters) {
						if (filters[filterId].filter.call(this, values, filters[filterId].options)) {
							// This filter is filtering this row, so skip it.
							continue nextRow;
						}
					}

				}

				this.rows.order[this.rows.order.length] = r;
			}

			this.applyRowsSort();
		};

		this.applyFilters = function() {
			this.applyRowsFilters();
		};

		this.getCellValue = function(row, col, field) {
			var cl = this.cols.values.length;
			var pos = this.rows.order[row] * cl + this.cols.order[col];

			var value = this.cells.values[pos];

			if (value == null) {
				return null;
			}

			return value[field];
		};

		this.getCellValueSelected = function(row, col) {
			return this.getCellValue(row, col, this.cells.selectedValue);
		};

		this.getRowValue = function(row, field) {
			return this.rows.values[this.rows.order[row]][field];
		};

		this.getRowValueSelected = function(row) {
			return this.getRowValue(row, this.rows.selectedValue);
		};

		this.getColValue = function(col, field) {
			return this.cols.values[this.cols.order[col]][field];
		};

		this.getColValueSelected = function(col) {
			return this.getColValue(col, this.cols.selectedValue);
		};

		this.init = function() {

			// Initialize rows order
			this.rows.order = [];
			for ( var r = 0; r < this.rows.values.length; r++) {
				this.rows.order[this.rows.order.length] = r;
			}

			// Initialize cols order
			this.cols.order = [];
			for ( var c = 0; c < this.cols.values.length; c++) {
				this.cols.order[this.cols.order.length] = c;
			}

			// Initialize sort columns
			this.cols.sort.type = "none";
			this.cols.sort.field = 0;
			this.cols.sort.asc = false;

			// Initialize sort rows
			this.rows.sort.type = "none";
			this.rows.sort.field = 0;
			this.rows.sort.asc = false;

			// Initialize decorators & aggregators
			for ( var f = 0; f < this.cells.header.length; f++) {
				this.cells.decorators[f] = heatmapDecorators['empty'];
				this.cells.aggregators[f] = heatmapAggregators['empty'];
			}

			for ( var c = 0; c < this.cols.header.length; c++) {
				this.cols.decorators[c] = heatmapDecorators['text'];
			}

			for ( var r = 0; r < this.rows.header.length; r++) {
				this.rows.decorators[r] = heatmapDecorators['text'];
			}

		};

		this.sortRowsByLabel = function(f, asc) {
			this.rows.sort.type = "label";
			this.rows.sort.field = f;
			this.rows.sort.asc = asc;
			this.applyRowsSort();
		};

		this.sortRowsByValue = function(asc) {
			this.rows.sort.type = "value";
			this.rows.sort.field = this.cells.selectedValue;
			this.rows.sort.asc = asc;
			this.applyRowsSort();
		};

		this.sortRowsByCol = function(col, asc) {
			this.rows.sort.type = "single";
			this.rows.sort.field = this.cells.selectedValue;
			this.rows.sort.asc = asc;
			this.rows.sort.item = this.cols.order[col];
			this.applyRowsSort();
		};

		this.applyRowsSort = function() {
			console.log("jHeatmap: .applyRowsSort()");
			var start = (new Date).getTime();

			if (this.rows.sort.type == "label") {
				this.rows.order.sort(function(o_a, o_b) {
					v_a = data.rows.values[o_a][data.rows.sort.field].toLowerCase();
					v_b = data.rows.values[o_b][data.rows.sort.field].toLowerCase();
					var val = (data.rows.sort.asc ? 1 : -1);
					return (v_a == v_b) ? 0 : (v_a > v_b ? val : -val);
				});
			} else if (this.rows.sort.type == "value") {
				var aggregation = [];

				var cl = this.cols.values.length;
				for ( var r = 0; r < this.rows.order.length; r++) {
					var sum = 0;
					for ( var c = 0; c < this.cols.order.length; c++) {
						var pos = this.rows.order[r] * cl + this.cols.order[c];
						var value = this.cells.values[pos];
						if (value != null) {
							sum = this.cells.aggregators[this.rows.sort.field].call(this, sum,
									value[this.rows.sort.field]);
						}
					}
					aggregation[this.rows.order[r]] = sum;
				}

				this.rows.order.sort(function(o_a, o_b) {
					var v_a = aggregation[o_a];
					var v_b = aggregation[o_b];
					var val = (data.rows.sort.asc ? 1 : -1);
					return (v_a == v_b) ? 0 : (v_a > v_b ? val : -val);
				});
			} else if (this.rows.sort.type == "single") {

				this.rows.order.sort(function(o_a, o_b) {
					var pos_a = (o_a * data.cols.values.length) + data.rows.sort.item;
					var pos_b = (o_b * data.cols.values.length) + data.rows.sort.item;

					var value_a = data.cells.values[pos_a];
					var value_b = data.cells.values[pos_b];

					var v_a = (value_a == null ? null : parseFloat(value_a[data.rows.sort.field]));
					var v_b = (value_b == null ? null : parseFloat(value_b[data.rows.sort.field]));

					var val = (data.rows.sort.asc ? 1 : -1);
					return (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
				});
			}

			var diff = (new Date).getTime() - start;
			console.log("jHeatmap: .applyRowsSort() - end - " + diff + "ms");
		};

		this.sortColsByLabel = function(f, asc) {
			this.cols.sort.type = "label";
			this.cols.sort.field = f;
			this.cols.sort.asc = asc;
			this.applyColsSort();
		};

		this.sortColsByRow = function(row, asc) {
			this.cols.sort.type = "single";
			this.cols.sort.field = this.cells.selectedValue;
			this.cols.sort.asc = asc;
			this.cols.sort.item = this.rows.order[row];
			this.applyColsSort();
		};

		this.sortColsByValue = function(asc) {
			this.cols.sort.type = "value";
			this.cols.sort.field = this.cells.selectedValue;
			this.cols.sort.asc = asc;
			this.applyColsSort();
		};

		this.applyColsSort = function() {
			console.log("jHeatmap: .applyColsSort() - start");
			var start = (new Date).getTime();

			if (this.cols.sort.type == "label") {
				this.cols.order.sort(function(o_a, o_b) {
					var v_a = data.cols.values[o_a][data.cols.sort.field].toLowerCase();
					var v_b = data.cols.values[o_b][data.cols.sort.field].toLowerCase();
					var val = (data.cols.sort.asc ? 1 : -1);
					return (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
				});

			} else if (this.cols.sort.type == "value") {
				var aggregation = [];
				var cl = this.cols.values.length;
				
				var cols = this.cols.order;
				var rows = this.rows.order;
				
				for ( var c = 0; c < cols.length; c++) {
					var sum = 0;
					for ( var r = 0; r < rows.length; r++) {
						var pos = rows[r] * cl + cols[c];
						var value = this.cells.values[pos];
						if (value != null) {
							sum = this.cells.aggregators[this.cells.selectedValue].call(this, sum,
									value[this.cols.sort.field]);
						}
					}
					aggregation[cols[c]] = sum;
				}

				this.cols.order.sort(function(o_a, o_b) {
					var v_a = aggregation[o_a];
					var v_b = aggregation[o_b];
					var val = (data.cols.sort.asc ? 1 : -1);
					return (v_a == v_b) ? 0 : (v_a > v_b ? val : -val);
				});

			} else if (this.cols.sort.type == "single") {

				var pos = this.cols.sort.item * this.cols.values.length;
				this.cols.order.sort(function(o_a, o_b) {
					var value_a = data.cells.values[pos + o_a];
					var value_b = data.cells.values[pos + o_b];
					var v_a = (value_a == null ? null : parseFloat(value_a[data.cols.sort.field]));
					var v_b = (value_b == null ? null : parseFloat(value_b[data.cols.sort.field]));
					var val = (data.cols.sort.asc ? 1 : -1);
					var result = (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
					return result;
				});
			}

			var diff = (new Date).getTime() - start;
			console.log("jHeatmap: .applyColsSort() - end - " + diff + "ms");
		};

		this.applySort = function() {
			this.applyRowsSort();
			this.applyColsSort();
		};

		this.loading = function(runme) {
			$('div.heatmap-loader').show();
			var interval = window.setInterval(function() {
				runme.call();
				$('div.heatmap-loader').hide();
				window.clearInterval(interval);
			}, 1);
		};

		this.paint = function(obj) {
			console.log("jHeatmap: .paint() - start");
			var start = (new Date).getTime();

			var chooseOrderImage = function(type) {

				if (type == "cols_by_label") {
					if (data.cols.sort.type != "label") {
						return basePath + "/images/cln.png";
					} else if (data.cols.sort.field != data.cols.selectedValue) {
						return basePath + "/images/cln.png";
					} else {
						return basePath + (data.cols.sort.asc ? "/images/cll.png" : "/images/clr.png");
					}
				}

				if (type == "rows_by_label") {
					if (data.rows.sort.type != "label") {
						return basePath + "/images/rln.png";
					} else if (data.rows.sort.field != data.rows.selectedValue) {
						return basePath + "/images/rln.png";
					} else {
						return basePath + (data.rows.sort.asc ? "/images/rlu.png" : "/images/rld.png");
					}
				}

				if (type == "cols_by_value") {
					if (data.cols.sort.type != "value") {
						return basePath + "/images/cvn.png";
					} else if (data.cols.sort.field != data.cells.selectedValue) {
						return basePath + "/images/cvn.png";
					} else {
						return basePath + (data.cols.sort.asc ? "/images/cvr.png" : "/images/cvl.png");
					}
				}

				if (type == "rows_by_value") {
					if (data.rows.sort.type != "value") {
						return basePath + "/images/rvn.png";
					} else if (data.rows.sort.field != data.cells.selectedValue) {
						return basePath + "/images/rvn.png";
					} else {
						return basePath + (data.rows.sort.asc ? "/images/rvd.png" : "/images/rvu.png");
					}
				}
			};

			// Minimum zooms
			var mcz = Math.max(3, Math.round(this.size.width / this.cols.order.length));
			var mrz = Math.max(3, Math.round(this.size.height / this.rows.order.length));

			// Zoom columns
			var cz = this.cols.zoom;
			cz = cz < mcz ? mcz : cz;
			cz = cz > 32 ? 32 : cz;
			this.cols.zoom = cz;

			// Zoom rows
			var rz = this.rows.zoom;
			rz = rz < mrz ? mrz : rz;
			rz = rz > 32 ? 32 : rz;
			this.rows.zoom = rz;

			// Offsets
			var maxHeight = 600;

			var maxCols = Math.min(data.cols.order.length, Math.round(this.size.width / cz) + 1);
			var maxRows = Math.min(data.rows.order.length, Math.round(this.size.height / rz) + 1);

			var top = this.offset.top;
			if (top < 0) {
				top = 0;
			}
			if (top > (data.rows.order.length - maxRows)) {
				top = (data.rows.order.length - maxRows);
			}
			this.offset.top = top;

			var left = this.offset.left;
			if (left < 0) {
				left = 0;
			}
			if (left > (data.cols.order.length - maxCols)) {
				left = (data.cols.order.length - maxCols);
			}
			this.offset.left = left;

			var startRow = this.offset.top;
			var endRow = Math.min(this.offset.top + maxRows, data.rows.order.length);

			var startCol = this.offset.left;
			var endCol = Math.min(this.offset.left + maxCols, data.cols.order.length);

			// Loader
			obj.html('<div class="heatmap-loader"><div class="background"></div><div class="progress"><img src="'
					+ basePath + '/images/loading.gif"></div></div>');

			var table = $("<table>", {
				"class" : "heatmap"
			});
			
			// top border
			var borderTop = $('<tr>', {
				'class' : 'border'
			});
			borderTop.append('<td><div class="detailsbox">cell details here</div></td>');

			/*
			 * TOP TOOLBAR
			 */

			var topToolbar = $("<td>", { colspan: 3 });

			// Order columns by label
			topToolbar.append($('<img>', {
				'src' : chooseOrderImage.call(this, "cols_by_label"),
				'title' : "Sort columns by label"
			}).click(function() {
				data.loading(function() {
					data.sortColsByLabel(data.cols.selectedValue, !data.cols.sort.asc);
					data.paint(obj);
				});
			}));

			// Order columns by value
			topToolbar.append($('<img>', {
				'src' : chooseOrderImage.call(this, "cols_by_value"),
				'title' : "Sort columns by value"
			}).click(function() {
				data.loading(function() {
					data.sortColsByValue(!data.cols.sort.asc);
					data.paint(obj);
				});
			}));

			// Separator
			topToolbar.append($('<img>', {
				'src' : basePath + "/images/sep.png"
			}));

			// Zoom cols -
			topToolbar.append($('<img>', {
				'src' : basePath + "/images/z_less.png",
				'title' : "Decrease columns width"
			}).click(function() {
				data.cols.zoom = data.cols.zoom - 3;
				data.paint(obj);
			}));

			// Zoom cols +
			topToolbar.append($('<img>', {
				'src' : basePath + "/images/z_plus.png",
				'title' : "Increase columns width"
			}).click(function() {
				data.cols.zoom = data.cols.zoom + 3;
				data.paint(obj);
			}));

			// Separator
			topToolbar.append($('<img>', {
				'src' : basePath + "/images/sep.png"
			}));

			// Move left
			topToolbar.append($('<img>', {
				'src' : basePath + "/images/hl.png",
				'title' : "Move selected columns to the left"
			}).click(function() {
				if (data.cols.selected.length > 0) {
					if ($.inArray(data.cols.order[0], data.cols.selected) == -1) {
						for ( var i = 1; i < data.cols.order.length; i++) {
							var index = $.inArray(data.cols.order[i], data.cols.selected);
							if (index != -1) {
								var prevCol = data.cols.order[i - 1];
								data.cols.order[i - 1] = data.cols.order[i];
								data.cols.order[i] = prevCol;
							}
						}
						data.paint(obj);
					}
				}
			}));

			// Move rigth
			topToolbar.append($('<img>', {
				'src' : basePath + "/images/hr.png",
				'title' : "Move selected columns to the right"
			}).click(function() {
				if (data.cols.selected.length > 0) {
					if ($.inArray(data.cols.order[data.cols.order.length - 1], data.cols.selected) == -1) {
						for ( var i = data.cols.order.length - 2; i >= 0; i--) {
							var index = $.inArray(data.cols.order[i], data.cols.selected);
							if (index != -1) {
								var nextCol = data.cols.order[i + 1];
								data.cols.order[i + 1] = data.cols.order[i];
								data.cols.order[i] = nextCol;
							}
						}
						data.paint(obj);
					}
				}
			}));
			
			// Separator
			topToolbar.append($('<img>', {
				'src' : basePath + "images/sep.png"
			}));
			
			// Select none
			topToolbar.append($('<img>', {
				'src' : basePath + "/images/shnone.png",
				'title' : "Unselect all columns"
			}).click(function() {
				data.cols.selected = [];
				data.paint(obj);
			}));
			
			// Select all visible
			topToolbar.append($('<img>', {
				'src' : basePath + "/images/shall.png",
				'title' : "Select all visible columns"
			}).click(function() {
				data.cols.selected = data.cols.order.slice(0);
				data.paint(obj);
			}));
			

			// Separator
			topToolbar.append($('<img>', {
				'src' : basePath + "images/sep.png"
			}));

			// Fullscreen
			topToolbar.append($('<img>', {
				'src' : basePath + "images/" + (data.size.fullscreen ? "nofull.png" : "full.png"),
				'title' : (data.size.fullscreen ? "Resize to original heatmap size" : "Resize to fit window size")
			}).click(function() {

				if (data.size.fullscreen) {
					data.size.width = data.size.fullscreen.width;
					data.size.height = data.size.fullscreen.height;
					delete data.size.fullscreen;
				} else {
					var wHeight = $(window).height();
					var wWidth = $(window).width();

					data.size.fullscreen = {
						width : data.size.width,
						height : data.size.height
					};
					
										
					data.size.width = wWidth - 290 - (14 * data.cols.annotations.length);
					data.size.height = wHeight - 290 - (10 * data.rows.annotations.length);
				}

				data.paint(obj);

			}));
			
			// Separator
			topToolbar.append($('<img>', {
				'src' : basePath + "images/sep.png"
			}));
			
			// Search
			var searchFunction = function() {
				data.search = searchField.val();
				if (data.search == "") {
					data.search = null;
				}
				data.paint(obj);
			};
			
			var searchField = $("<input>", {
				'type': 'search',
				'placeholder' : "Search...",
				'name' : "jheatmap-search",
				'value': data.search 
			});
			
			// HTML5 compatibility?
			//searchField.keyup(function(e) {
			//	if(e.keyCode == 13) {
			//		searchFunction();
			//	}
			//});
			
			searchField.bind('search', function(e) {
				searchFunction();
			});
			
			topToolbar.append(searchField);
			
			borderTop.append(topToolbar);
			table.append(borderTop);

			var firstRow = $("<tr>");
			table.append(firstRow);

			/*
			 * LEFT TOOLBAR
			 */

			var leftToolbar = $('<th>', {
				'class' : 'border',
				'rowspan' : 3 + (data.cols.annotations.length > 0 ? 1 : 0)
			});
			firstRow.append(leftToolbar);

			// Sort rows by label
			leftToolbar.append($('<img>', {
				'src' : chooseOrderImage.call(this, "rows_by_label"),
				'title' : "Sort rows by label"
			}).click(function() {
				data.loading(function() {
					data.sortRowsByLabel(data.rows.selectedValue, !data.rows.sort.asc);
					data.paint(obj);
				});
			}));
			leftToolbar.append($("<br>"));

			// Sort rows by value
			leftToolbar.append($('<img>', {
				'src' : chooseOrderImage.call(this, "rows_by_value"),
				'title' : "Sort rows by value"
			}).click(function() {
				data.loading(function() {
					data.sortRowsByValue(!data.rows.sort.asc);
					data.paint(obj);
				});
			}));
			leftToolbar.append($("<br>"));

			// Separator
			leftToolbar.append($('<img>', {
				'src' : basePath + "/images/sep.png"
			}));

			// Zoom rows -
			leftToolbar.append($('<img>', {
				'src' : basePath + "/images/z_less.png",
				'title' : "Decrease rows height"
			}).click(function() {
				data.rows.zoom = data.rows.zoom - 3;
				data.paint(obj);
			}));
			leftToolbar.append($('<br>'));

			// Zoom rows +
			leftToolbar.append($('<img>', {
				'src' : basePath + "/images/z_plus.png",
				'title' : "Increase rows height"
			}).click(function() {
				data.rows.zoom = data.rows.zoom + 3;
				data.paint(obj);
			}));
			leftToolbar.append($('<br>'));

			// Separator
			leftToolbar.append($('<img>', {
				'src' : basePath + "/images/sep.png"
			}));
			leftToolbar.append($('<br>'));

			// Move up
			leftToolbar.append($('<img>', {
				'src' : basePath + "/images/vu.png",
				'title' : "Move selected columns up"
			}).click(function() {
				if (data.rows.selected.length > 0) {
					if ($.inArray(data.rows.order[0], data.rows.selected) == -1) {
						for ( var i = 1; i < data.rows.order.length; i++) {
							var index = $.inArray(data.rows.order[i], data.rows.selected);
							if (index != -1) {
								var prevRow = data.rows.order[i - 1];
								data.rows.order[i - 1] = data.rows.order[i];
								data.rows.order[i] = prevRow;
							}
						}
						data.paint(obj);
					}
				}
			}));
			leftToolbar.append($('<br>'));

			// Move down
			leftToolbar.append($('<img>', {
				'src' : basePath + "/images/vd.png",
				'title' : "Move selected columns down"
			}).click(function() {
				if (data.rows.selected.length > 0) {
					if ($.inArray(data.rows.order[data.rows.order.length - 1], data.rows.selected) == -1) {
						for ( var i = data.rows.order.length - 2; i >= 0; i--) {
							var index = $.inArray(data.rows.order[i], data.rows.selected);
							if (index != -1) {
								var nextRow = data.rows.order[i + 1];
								data.rows.order[i + 1] = data.rows.order[i];
								data.rows.order[i] = nextRow;
							}
						}
						data.paint(obj);
					}
				}
			}));
			
			// Separator
			leftToolbar.append($('<img>', {
				'src' : basePath + "images/sep.png"
			}));
			leftToolbar.append($('<br>'));
			
			// Select none
			leftToolbar.append($('<img>', {
				'src' : basePath + "/images/svnone.png",
				'title' : "Unselect all selected rows"
			}).click(function() {
				data.rows.selected = [];
				data.paint(obj);
			}));
			leftToolbar.append($('<br>'));
			
			// Select all visible
			leftToolbar.append($('<img>', {
				'src' : basePath + "/images/svall.png",
				'title' : "Select all visible rows"
			}).click(function() {
				data.rows.selected = data.rows.order.slice(0);
				data.paint(obj);
			}));
			leftToolbar.append($('<br>'));

			/*
			 * TOP-LEFT PANEL
			 */

			var topleftPanel = $("<th>", {
				"class" : "topleft"
			});
			firstRow.append(topleftPanel);

			// Add filters
			for (filterId in data.filters) {

				var filterDef = data.filters[filterId];

				if ($.inArray(data.cells.selectedValue, filterDef.fields) > -1) {

					var checkInput = $('<input type="checkbox">');
					checkInput.prop('checked', data.getRowsFilter(filterId));
					checkInput.click(function() {
						var checkbox = $(this);
						data.loading(function() {
							if (checkbox.is(':checked')) {
								data.addRowsFilter(filterId);
							} else {
								data.removeRowsFilter(filterId);
							}
							data.applyRowsFilters();
							data.paint(obj);
						});
					});

					topleftPanel.append($('<div>', {
						'class' : 'filter'
					}).append(checkInput).append($('<span>').html(filterDef.title)));

				}
			}

			// Add column selector
			var selectCol = $("<select>").change(function() {
				var value = $(this)[0].value;
				data.cols.selectedValue = value;
				data.loading(function() {
					data.paint(obj);
				});
			});
			topleftPanel.append(selectCol);
			for ( var o = 0; o < this.cols.header.length; o++) {
				selectCol.append(new Option(this.cols.header[o], o, o == this.cols.selectedValue));
			}
			selectCol.val(this.cols.selectedValue);
			topleftPanel.append($("<span>Columns</span>"));
			topleftPanel.append($("<br>"));

			// Add row selector
			var selectRow = $("<select>").change(function() {
				var value = $(this)[0].value;
				data.rows.selectedValue = value;
				data.loading(function() {
					data.paint(obj);
				});
			});
			topleftPanel.append(selectRow);
			topleftPanel.append($("<span>Rows</span>"));
			topleftPanel.append($("<br>"));

			for ( var o = 0; o < this.rows.header.length; o++) {
				selectRow.append(new Option(this.rows.header[o], o, o == this.rows.selectedValue));
			}
			selectRow.val(this.rows.selectedValue);

			// Add cell selector
			var selectCell = $("<select>").change(function() {
				var value = $(this)[0].value;
				data.cells.selectedValue = value;
				data.loading(function() {
					data.paint(obj);
				});
			});
			topleftPanel.append(selectCell);
			topleftPanel.append($("<span>Cells</span>"));
			topleftPanel.append($("<br>"));

			for ( var o = 0; o < this.cells.header.length; o++) {
				selectCell.append(new Option(this.cells.header[o], o, o == this.cells.selectedValue));
			}
			selectCell.val(this.cells.selectedValue);

			/*******************************************************************
			 * COLUMN HEADERS *
			 ******************************************************************/

			// Add column headers
			var colHeader = $("<th>");
			firstRow.append(colHeader);

			var colCanvas = $("<canvas width='" + data.size.width + "' height='150'></canvas>");
			colCanvas.click(function(e) {
				var pos = $(this).position();
				var col = data.cols.order[Math.floor((e.pageX-pos.left) / cz) + data.offset.left];

				var index = $.inArray(col, data.cols.selected);
				if (index > -1) {
					data.cols.selected.splice(index, 1);
				} else {
					data.cols.selected[data.cols.selected.length] = col;
				}
				data.paint(obj);

			});
			colHeader.append(colCanvas);

			var colCtx = colCanvas.get()[0].getContext('2d');
			
			colCtx.fillStyle = "black";
			colCtx.textAlign = "right";
			colCtx.textBaseline = "middle";
			colCtx.font = (cz > 12 ? 12 : cz) + "px Verdana";

			for ( var c = startCol; c < endCol; c++) {
				var value = data.getColValueSelected(c);
				colCtx.save();
				colCtx.translate((c - startCol) * cz + (cz / 2), 150);
				colCtx.rotate(Math.PI / 2);
				colCtx.fillText(value, 0, 0);
				colCtx.restore();

				if ($.inArray(data.cols.order[c], data.cols.selected) > -1) {
					colCtx.fillStyle = "rgba(0,0,0,0.2)";
					colCtx.fillRect((c - startCol) * cz, 0, cz, 150);
					colCtx.fillStyle = "black";
				}
				
				if (data.search != null && value.toUpperCase().indexOf(data.search.toUpperCase()) != -1 ) {
					colCtx.fillStyle = "rgba(255,255,0,0.3)";
					colCtx.fillRect((c - startCol) * cz, 0, cz, 150);
					colCtx.fillStyle = "black";
				}
			}
			firstRow.append("<th class='borderF'>&nbsp;</th>");

			/*******************************************************************
			 * ADD ROW HEADER ANNOTATIONS
			 ******************************************************************/

			if (data.rows.annotations.length > 0) {
				var rowspan = (data.cols.annotations.length > 0 ? 2 : 1);

				var annRowHead = $("<th>", {
					'class' : 'borderF',
					'rowspan' : rowspan
				});
				firstRow.append(annRowHead);
				firstRow.append($("<th>", {
					'class' : 'borderL',
					'rowspan' : rowspan
				}));

				var annRowHeadCanvas = $("<canvas width='" + 10 * data.rows.annotations.length
						+ "' height='150'></canvas>");
				annRowHead.append(annRowHeadCanvas);
				var annRowHeadCtx = annRowHeadCanvas.get()[0].getContext('2d');
				annRowHeadCtx.fillStyle = "rgb(255,255,255)";
				annRowHeadCtx.textAlign = "right";
				annRowHeadCtx.textBaseline = "middle";
				annRowHeadCtx.font = "bold 11px Verdana";

				for ( var i = 0; i < data.cols.annotations.length; i++) {

					var value = data.cols.header[data.cols.annotations[i]];
					annRowHeadCtx.save();
					annRowHeadCtx.translate(i * 10 + 5, 150);
					annRowHeadCtx.rotate(Math.PI / 2);
					annRowHeadCtx.fillText(value, 0, 0);
					annRowHeadCtx.restore();
				}

			} else {
				firstRow.append("<th class='borderL'>&nbsp;</th>");
			}

			/*******************************************************************
			 * ADD COLUMN ANNOTATIONS
			 ******************************************************************/

			if (data.cols.annotations.length > 0) {

				firstRow = $("<tr class='annotations'>");
				table.append(firstRow);
				
				var colAnnHeaderCell = $("<th>", {
					"class" : "borderF"
				});
				var colAnnHeaderCanvas = $("<canvas style='float:right;' width='200' height='" + 10
						* data.cols.annotations.length + "'></canvas>");
				colAnnHeaderCell.append(colAnnHeaderCanvas);
				firstRow.append(colAnnHeaderCell);

				var colAnnHeaderCtx = colAnnHeaderCanvas.get()[0].getContext('2d');
				colAnnHeaderCtx.fillStyle = "rgb(255,255,255)";
				colAnnHeaderCtx.textAlign = "right";
				colAnnHeaderCtx.textBaseline = "middle";
				colAnnHeaderCtx.font = "bold 11px Verdana";

				for ( var i = 0; i < data.cols.annotations.length; i++) {
					var value = data.cols.header[data.cols.annotations[i]];
					colAnnHeaderCtx.fillText(value, 200, (i * 10) + 5);
				}

				var colAnnValuesCell = $("<th>");
				var colAnnValuesCanvas = $("<canvas width='" + data.size.width + "' height='" + 10
						* data.cols.annotations.length + "'></canvas>");
				colAnnValuesCell.append(colAnnValuesCanvas);
				firstRow.append(colAnnValuesCell);

				var colAnnValuesCtx = colAnnValuesCanvas.get()[0].getContext('2d');

				for ( var i = 0; i < data.cols.annotations.length; i++) {
					for ( var col = startCol; col < endCol; col++) {

						var field = data.cols.annotations[i];
						var value = data.getColValue(col, field);

						if (value != null) {
							var color = data.cols.decorators[field].call(this, value);
							colAnnValuesCtx.fillStyle = color;
							colAnnValuesCtx.fillRect((col - startCol) * cz, i * 10, cz, 10);
						}
					}
				}

				for ( var col = startCol; col < endCol; col++) {
					if ($.inArray(data.cols.order[col], data.cols.selected) > -1) {
						colAnnValuesCtx.fillStyle = "rgba(0,0,0,0.2)";
						colAnnValuesCtx.fillRect((col - startCol) * cz, 0, cz, data.cols.annotations.length * 10);
						colAnnValuesCtx.fillStyle = "white";
					}
				}

				firstRow.append("<th class='borderF'>&nbsp;</th>");

			}
			
			// Add left border
			var tableRow = $('<tr>');
			
			/*******************************************************************
			 * ROWS HEADERS *
			 ******************************************************************/

			var rowsCell = $("<td>", {
				"class" : "row"
			});

			var rowsCanvas = $("<canvas width='230' height='" + data.size.height + "'></canvas>");

			rowsCanvas.click(function(e) {
				var pos = $(this).position();
				var row = data.rows.order[Math.floor((e.pageY - pos.top) / rz) + data.offset.top];

				var index = $.inArray(row, data.rows.selected);
				if (index > -1) {
					data.rows.selected.splice(index, 1);
				} else {
					data.rows.selected[data.rows.selected.length] = row;
				}
				data.paint(obj);
			});

			rowsCell.append(rowsCanvas);
			tableRow.append(rowsCell);

			var rowCtx = rowsCanvas.get()[0].getContext('2d');
			rowCtx.fillStyle = "black";
			rowCtx.textAlign = "right";
			rowCtx.textBaseline = "middle";
			rowCtx.font = (rz > 12 ? 12 : rz) + "px Verdana";

			for ( var row = startRow; row < endRow; row++) {
				var value = data.getRowValueSelected(row);
				rowCtx.fillText(value, 230, ((row - startRow) * rz) + (rz / 2));

				if ($.inArray(data.rows.order[row], data.rows.selected) > -1) {
					rowCtx.fillStyle = "rgba(0,0,0,0.3)";
					rowCtx.fillRect(0, ((row - startRow) * rz), 230, rz);
					rowCtx.fillStyle = "black";
				}
				
				if (data.search != null && value.toUpperCase().indexOf(data.search.toUpperCase()) != -1 ) {
					rowCtx.fillStyle = "rgba(255,255,0,0.3)";
					rowCtx.fillRect(0, ((row - startRow) * rz), 230, rz);
					rowCtx.fillStyle = "black";
				}

			}

			/*******************************************************************
			 * HEATMAP CELLS *
			 ******************************************************************/

			var heatmapCell = $('<td>');
			tableRow.append(heatmapCell);

			var heatmapCanvas = $("<canvas width='" + data.size.width + "' height='" + data.size.height + "'></canvas>");
			heatmapCell.append(heatmapCanvas);

			// Paint heatmap
			var cellCtx = heatmapCanvas.get()[0].getContext('2d');
			for ( var row = startRow; row < endRow; row++) {

				for ( var col = startCol; col < endCol; col++) {

					// Iterate all values
					var value = data.getCellValueSelected(row, col);

					if (value != null) {
						var color = data.cells.decorators[data.cells.selectedValue].call(this, value);
						cellCtx.fillStyle = color;
						cellCtx.fillRect((col - startCol) * cz, (row - startRow) * rz, cz, rz);
					}
				}

				if ($.inArray(data.rows.order[row], data.rows.selected) > -1) {
					cellCtx.fillStyle = "rgba(0,0,0,0.2)";
					cellCtx.fillRect(0, (row - startRow) * rz, (endCol - startCol) * cz, rz);
					cellCtx.fillStyle = "white";
				}
			}

			// Paint selected columns
			for ( var col = startCol; col < endCol; col++) {
				if ($.inArray(data.cols.order[col], data.cols.selected) > -1) {
					cellCtx.fillStyle = "rgba(0,0,0,0.2)";
					cellCtx.fillRect((col - startCol) * cz, 0, cz, (endRow - startRow) * rz);
					cellCtx.fillStyle = "white";
				}
			}
			;

			var zoomHeatmap = function(zoomin, col, row) {
				if (zoomin) {
					data.cols.zoom += 3;
					data.rows.zoom += 3;

					var ncz = cz + 3;
					ncz = ncz < 3 ? 3 : ncz;
					ncz = ncz > 32 ? 32 : ncz;

					// Zoom rows
					var nrz = rz + 3;
					nrz = nrz < 3 ? 3 : nrz;
					nrz = nrz > 32 ? 32 : nrz;

					var ml = Math.round(col - data.offset.left - ((cz * (col - data.offset.left)) / ncz));
					var mt = Math.round(row - data.offset.top - ((rz * (row - data.offset.top)) / nrz));

					data.offset.left += ml;
					data.offset.top += mt;
				} else {
					data.cols.zoom -= 3;
					data.rows.zoom -= 3;

					var ncz = cz - 3;
					ncz = ncz < 3 ? 3 : ncz;
					ncz = ncz > 32 ? 32 : ncz;

					// Zoom rows
					var nrz = rz - 3;
					nrz = nrz < 3 ? 3 : nrz;
					nrz = nrz > 32 ? 32 : nrz;

					var ml = Math.round(col - data.offset.left - ((cz * (col - data.offset.left)) / ncz));
					var mt = Math.round(row - data.offset.top - ((rz * (row - data.offset.top)) / nrz));

					data.offset.left += ml;
					data.offset.top += mt;
				}

				if (!(nrz == rz && ncz == cz)) {
					data.paint(obj);
				}
			};

			heatmapCanvas.bind('mousewheel', function(e, delta, deltaX, deltaY) {
				var pos = $(this).position();
				var col = Math.floor((e.pageX-pos.left) / cz) + data.offset.left;
				var row = Math.floor((e.pageY-pos.top) / rz) + data.offset.top;
				var zoomin = delta / 120 > 0;

				zoomHeatmap(zoomin, col, row);
			});

			heatmapCanvas.bind('gesturechange', function(e) {
				e.preventDefault();
			});

			heatmapCanvas.bind('gestureend', function(e) {
				e.preventDefault();

				var col = Math.round(startCol + ((endCol - startCol) / 2));
				var row = Math.round(startRow + ((endRow - startRow) / 2));
				var zoomin = e.originalEvent.scale > 1;

				console.log("zoomin=" + zoomin + " col=" + col + " row=" + row + " startRow=" + startRow + " endRow="
						+ endRow);
				zoomHeatmap(zoomin, col, row);
			});

			var downX = null;
			var downY = null;

			heatmapCanvas.bind('vmousedown', function(e) {
				e.preventDefault();
				downX = e.pageX;
				downY = e.pageY;
			});

			heatmapCanvas.bind('vmouseup', function(e) {
				e.preventDefault();

				if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
					return;
				}

				var pX = e.pageX - downX;
				var pY = e.pageY - downY;

				var c = Math.round(pX / cz);
				var r = Math.round(pY / rz);

				data.offset.top -= r;
				data.offset.left -= c;

				if (!(r == 0 && c == 0)) {
					data.paint(obj);
				}
			});
			
			// Show details box
			heatmapCanvas.bind('vclick', function(e) {
				
				var pos = $(this).position();
				var col = Math.floor((e.originalEvent.pageX-pos.left) / cz) + data.offset.left;
				var row = Math.floor((e.originalEvent.pageY-pos.top) / rz) + data.offset.top;
				
				var cl = data.cols.values.length;
				var pos = data.rows.order[row] * cl + data.cols.order[col];
				var value = data.cells.values[pos];
								
				var details = $('table.heatmap div.detailsbox');
				
				var boxTop = e.originalEvent.pageY;
				var boxLeft = e.originalEvent.pageX;
				var boxWidth;
				var boxHeight;
				
				if (value == null) {
					details.html("<ul><li>No data</li></ul>");
					boxWidth = 120;
					boxHeight = 40;
					
				} else {
					var boxHtml = "<ul>";
					boxHtml += "<li><strong>Column:</strong> " + data.getColValueSelected(col) + "</li>";
					boxHtml += "<li><strong>Row:</strong> " + data.getRowValueSelected(row) + "</li>";
					for (var i=0; i < data.cells.header.length; i++) {
						boxHtml += "<li>";
						boxHtml += "<strong>" + data.cells.header[i] + ":</strong> ";
						boxHtml += value[i];
						boxHtml += "</li>";
					}
					boxHtml += "</ul>";
					
					details.html(boxHtml);
					boxWidth = 300;
					boxHeight = 60 + (data.cells.header.length*20);
				}
				
				var wHeight = $(document).height();
				var wWidth = $(document).width();
				
				if (boxTop + boxHeight > wHeight) {
					boxTop -= boxHeight;
				} 
				
				if (boxLeft + boxWidth > wWidth) {
					boxLeft -= boxWidth;
				} 
				
				details.css('left', boxLeft);
				details.css('top', boxTop);
				details.css('width', boxWidth);
				details.css('height', boxHeight);
				
				details.css('display', 'block');
				details.bind('vclick', function(e) {
					$(this).css('display', 'none');
				});
				
			});

			/*******************************************************************
			 * Vertical scroll
			 ******************************************************************/

			var scrollVert = $("<td class='borderL'>");
			tableRow.append(scrollVert);

			var maxHeight = (endRow - startRow) * rz;
			var scrollVertCanvas = $("<canvas width='10' height='" + data.size.height + "'></canvas>");
			scrollVert.append(scrollVertCanvas);

			var scrollVertCtx = scrollVertCanvas.get()[0].getContext('2d');

			scrollVertCtx.fillStyle = "rgba(0,0,0,0.4)";
			var iniY = Math.round(maxHeight * (startRow / data.rows.order.length));
			var endY = Math.round(maxHeight * (endRow / data.rows.order.length));
			scrollVertCtx.fillRect(0, iniY, 10, endY - iniY);

			scrollVertCanvas.click(function(e) {
				var pos = $(this).position();
				var pY = e.pageY - pos.top - ((endY - iniY) / 2);
				pY = (pY < 0 ? 0 : pY);
				data.offset.top = Math.round((pY / maxHeight) * data.rows.order.length);
				data.paint(obj);
			});

			/*******************************************************************
			 * Vertical annotations
			 ******************************************************************/

			if (data.rows.annotations.length > 0) {

				var rowsAnnCell = $("<td class='borderL'>");
				tableRow.append(rowsAnnCell);

				var rowsAnnCanvas = $("<canvas width='" + data.rows.annotations.length * 10 + "' height='"
						+ data.size.height + "'></canvas>");
				rowsAnnCell.append(rowsAnnCanvas);

				// Paint heatmap
				var rowsAnnValuesCtx = rowsAnnCanvas.get()[0].getContext('2d');
				for ( var row = startRow; row < endRow; row++) {

					for ( var i = 0; i < data.rows.annotations.length; i++) {
						var field = data.rows.annotations[i];
						var value = data.getRowValue(row, field);

						if (value != null) {
							var color = data.rows.decorators[field].call(this, value);
							rowsAnnValuesCtx.fillStyle = color;
							rowsAnnValuesCtx.fillRect(i * 10, (row - startRow) * rz, 10, rz);
						}

					}

					if ($.inArray(data.rows.order[row], data.rows.selected) > -1) {
						rowsAnnValuesCtx.fillStyle = "rgba(0,0,0,0.2)";
						rowsAnnValuesCtx.fillRect(0, (row - startRow) * rz, data.rows.annotations.length * 10, rz);
						rowsAnnValuesCtx.fillStyle = "white";
					}
				}

			}

			// Right table border
			tableRow.append("<td class='borderL'>&nbsp;</td>");
			table.append(tableRow);

			/*******************************************************************
			 * Horitzontal scroll
			 ******************************************************************/
			var scrollRow = $('<tr>');
			scrollRow.append("<td class='borderF'></td>");
			var scrollHor = $("<td class='borderT'>");
			scrollRow.append(scrollHor);
			scrollRow.append("<td class='borderF'></td>");

			if (data.rows.annotations.length > 0) {
				scrollRow.append("<td class='borderF'></td>");
			}

			var maxWidth = (endCol - startCol) * cz;
			var scrollHorCanvas = $("<canvas width='" + data.size.width + "' height='10'></canvas>");
			scrollHor.append(scrollHorCanvas);

			var scrollHorCtx = scrollHorCanvas.get()[0].getContext('2d');

			scrollHorCtx.fillStyle = "rgba(0,0,0,0.4)";
			var iniX = Math.round(maxWidth * (startCol / data.cols.order.length));
			var endX = Math.round(maxWidth * (endCol / data.cols.order.length));
			scrollHorCtx.fillRect(iniX, 0, endX - iniX, 10);

			scrollHorCanvas.click(function(e) {
				var pos = $(this).position();
				var pX = e.pageX - pos.left - ((endX - iniX) / 2);
				pX = (pX < 0 ? 0 : pX);
				data.offset.left = Math.round((pX / maxWidth) * data.cols.order.length);
				data.paint(obj);
			});

			table.append(scrollRow);

			/*******************************************************************
			 * Close table
			 ******************************************************************/

			// Last border row
			var lastRow = $('<tr>');
			lastRow.append("<td class='border'></td>");
			lastRow.append("<td class='borderT'></td>");
			lastRow.append("<td class='borderT'></td>");
			if (data.rows.annotations.length > 0) {
				lastRow.append("<td class='borderT'></td>");
			}
			lastRow.append("<td class='border'></td>");
			table.append(lastRow);
			obj.append(table);
			$('div.heatmap-loader').hide();

		};

	}
	;

	String.prototype.splitCSV = function(sep) {
		for ( var thisCSV = this.split(sep = sep || ","), x = thisCSV.length - 1, tl; x >= 0; x--) {
			if (thisCSV[x].replace(/"\s+$/, '"').charAt(thisCSV[x].length - 1) == '"') {
				if ((tl = thisCSV[x].replace(/^\s+"/, '"')).length > 1 && tl.charAt(0) == '"') {
					thisCSV[x] = thisCSV[x].replace(/^\s*"|"\s*$/g, '').replace(/""/g, '"');
				} else if (x) {
					thisCSV.splice(x - 1, 2, [ thisCSV[x - 1], thisCSV[x] ].join(sep));
				} else
					thisCSV = thisCSV.shift().split(sep).concat(thisCSV);
			} else
				thisCSV[x].replace(/""/g, '"');
		}
		return thisCSV;
	};

	String.prototype.startsWith = function(str) {
		return (this.match("^" + str) == str);
	};

	var data = new Heatmap();

	var methods = {

		// Load one file.
		readfile : function(csvFile, sep, result, parse) {
			$.ajax({
				url : csvFile,
				success : function(data) {
					var lines = data.replace('\r', '').split('\n');
					$.each(lines, function(lineCount, line) {
						if (line.length > 0 && !line.startsWith("#")) {
							if (lineCount == 0) {
								result.header = line.splitCSV(sep);
							} else {
								var valuesRow = [];
								if (parse) {
									var textValues = line.splitCSV(sep);
									for ( var i = 0; i < textValues.length; i++) {
										valuesRow[valuesRow.length] = parseFloat(textValues[i]);
									}
								} else {
									valuesRow = line.splitCSV(sep);
								}
								result.values[result.values.length] = valuesRow;
							}
						}
					});
				},
				dataType : "text"
			});
		},

		// Load all the data files.
		load : function(data, options) {
			data.sync = false;

			if (options.data.type == "raw" || options.data.type == "tcm") {
				methods['readfile'].call(this, options.data.rows, options.separator, data.rows, false);
				methods['readfile'].call(this, options.data.cols, options.separator, data.cols, false);
				methods['readfile'].call(this, options.data.values, options.separator, data.cells, false);
			} else if (options.data.type == "cdm") {
				methods['readfile'].call(this, options.data.values, options.separator, data.cells, false);
			}
		},

		init : function(options) {
			var obj = $(this);
			obj.html('<div class="heatmap-loader"><div class="background"></div><div class="progress"><img src="'
					+ basePath + 'images/loading.gif"></div></div>');
			obj.ajaxStop(function() {
				if (!data.sync) {

					data.loading(function() {

						// Two columns matrix format
						if (options.data.type == "tcm") {

							var cellValues = [];

							// Create a null matrix
							var totalPos = data.rows.values.length * data.cols.values.length;
							for ( var pos = 0; pos < totalPos; pos++) {
								cellValues[pos] = null;
							}

							// Try to deduce with column is the row primary key.
							var rowKey;
							var valuesRowKey;
							for ( var i = 0; i < data.rows.header.length; i++) {
								if ((valuesRowKey = $.inArray(data.rows.header[i], data.cells.header)) > -1) {
									rowKey = i;
									break;
								}
							}

							// Try to deduce with column is the column primary
							// key.
							var colKey;
							var valuesColKey;
							for ( var i = 0; i < data.cols.header.length; i++) {
								if ((valuesColKey = $.inArray(data.cols.header[i], data.cells.header)) > -1) {
									if (valuesColKey != valuesRowKey) {
										colKey = i;
										break;
									}
								}
							}

							// Build hashes
							var rowHash = {};
							for ( var i = 0; i < data.rows.values.length; i++) {
								rowHash[(data.rows.values[i][rowKey]).toString()] = i;
							}
							var colHash = {};
							for ( var i = 0; i < data.cols.values.length; i++) {
								colHash[(data.cols.values[i][colKey]).toString()] = i;
							}

							var cl = data.cols.values.length;
							for ( var i = 0; i < data.cells.values.length; i++) {

								var value = data.cells.values[i];

								if (value != null) {
									var rowIndex = rowHash[value[valuesRowKey]];
									var colIndex = colHash[value[valuesColKey]];

									var pos = rowIndex * cl + colIndex;

									cellValues[pos] = value;
								}
							}

							delete data.cells.values;
							data.cells.values = cellValues;

							// Continuous data matrix format
						} else if (options.data.type == "cdm") {

							data.cols.header = [ "Column" ];
							for ( var i = 0; i < data.cells.header.length; i++) {
								data.cols.values[data.cols.values.length] = [ data.cells.header[i] ];
							}

							var cellValues = [];
							data.rows.header = [ "Row" ];
							for ( var row = 0; row < data.cells.values.length; row++) {
								data.rows.values[data.rows.values.length] = [ data.cells.values[row][0] ];
								for ( var col = 0; col < data.cols.values.length; col++) {
									cellValues[cellValues.length] = [ data.cells.values[row][col + 1] ];
								}
							}

							delete data.cells.header;
							delete data.cells.values;
							data.cells.header = [ "Value" ];
							data.cells.values = cellValues;
						}

						// Reset orders
						data.init();

						// Call init function
						options.init.call(this, data);

						// Paint the heatmap
						data.paint(obj);
						data.sync = true;

					});
				}

			});

			// Load all the data files on init
			methods['load'].call(this, data, options);

		}

	};

	// Main function that creates the heatmap
	$.fn.heatmap = function(options) {
		var defaults = {
			separator : "\t",
			data : {
				type : "raw",
				rows : "heatmap-rows.tsv",
				cols : "heatmap-cols.tsv",
				values : "heatmap-values.tsv"
			},
			init : function(heatmap) {
			}
		};
		var options = $.extend(defaults, options);
		return this.each(methods['init'].call(this, options));
	};

})(jQuery);