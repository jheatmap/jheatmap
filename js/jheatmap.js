/**
 * Author: Jordi Deu-Pons
 * 
 * Credit to jquerycsvtotable. http://code.google.com/p/jquerycsvtotable/
 * splitCSV: credit goes to Brian Huisman. http://www.greywyvern.com/?post=258
 */
(function($) {

	function Heatmap() {

		this.tooltip = true;

		this.sync = false;

		this.filters = {};

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
			annotations : []
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
			annotations : []
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
					this.rows.order.push(r);
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
						values.push(this.cells.values[pos][field]);
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

				this.rows.order.push(r);
			}

			this.applyRowsSort();
		};

		this.applyFilters = function() {
			this.applyRowsFilters();
		};

		this.getCellValue = function(row, col, field) {
			var cl = this.cols.values.length;
			var pos = this.rows.order[row] * cl + this.cols.order[col];

			return this.cells.values[pos][field];
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
				this.rows.order.push(r);
			}

			// Initialize cols order
			this.cols.order = [];
			for ( var c = 0; c < this.cols.values.length; c++) {
				this.cols.order.push(c);
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
						var value = this.cells.values[pos][this.rows.sort.field];
						sum = this.cells.aggregators[this.rows.sort.field].call(this, sum, value);
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

					var v_a = parseFloat(data.cells.values[pos_a][data.rows.sort.field]);
					var v_b = parseFloat(data.cells.values[pos_b][data.rows.sort.field]);

					var val = (data.rows.sort.asc ? 1 : -1);
					return (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
				});
			}
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
				for ( var c = 0; c < this.cols.order.length; c++) {
					var sum = 0;
					for ( var r = 0; r < this.rows.order.length; r++) {
						var pos = this.rows.order[r] * cl + this.cols.order[c];
						var value = this.cells.values[pos][this.cols.sort.field];
						sum = this.cells.aggregators[this.cells.selectedValue].call(this, sum, value);
					}
					aggregation[this.cols.order[c]] = sum;
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
					var v_a = parseFloat(data.cells.values[pos + o_a][data.cols.sort.field]);
					var v_b = parseFloat(data.cells.values[pos + o_b][data.cols.sort.field]);
					var val = (data.cols.sort.asc ? 1 : -1);
					var result = (v_a == v_b) ? 0 : ((v_a > v_b) ? val : -val);
					return result;
				});
			}
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

		this.zoom = function() {

			// Zoom columns
			var cols = $('table.heatmap th div.col');
			var cz = this.cols.zoom;
			cz = cz < 1 ? 1 : cz;
			cz = cz > 32 ? 32 : cz;
			this.cols.zoom = cz;

			var cf = Math.round(((cz - 1) / 3) + 8);
			cf = cf > 12 ? 12 : cf;

			cols.css('width', cz);
			cols.css('font-size', cf);

			// Zoom rows
			var rows = $('table.heatmap td');
			var rz = this.rows.zoom;
			rz = rz < 1 ? 1 : rz;
			rz = rz > 32 ? 32 : rz;
			this.rows.zoom = rz;

			var rf = Math.round(((rz - 1) / 3) + 5);
			rf = rf > 12 ? 12 : rf;

			rows.css('font-size', rf);

		};

		this.paint = function(obj) {
			var chooseOrderImage = function(type) {

				if (type == "cols_by_label") {
					if (data.cols.sort.type != "label") {
						return "images/cln.png";
					} else if (data.cols.sort.field != data.cols.selectedValue) {
						return "images/cln.png";
					} else {
						return (data.cols.sort.asc ? "images/cll.png" : "images/clr.png");
					}
				}

				if (type == "rows_by_label") {
					if (data.rows.sort.type != "label") {
						return "images/rln.png";
					} else if (data.rows.sort.field != data.rows.selectedValue) {
						return "images/rln.png";
					} else {
						return (data.rows.sort.asc ? "images/rlu.png" : "images/rld.png");
					}
				}

				if (type == "cols_by_value") {
					if (data.cols.sort.type != "value") {
						return "images/cvn.png";
					} else if (data.cols.sort.field != data.cells.selectedValue) {
						return "images/cvn.png";
					} else {
						return (data.cols.sort.asc ? "images/cvr.png" : "images/cvl.png");
					}
				}

				if (type == "rows_by_value") {
					if (data.rows.sort.type != "value") {
						return "images/rvn.png";
					} else if (data.rows.sort.field != data.cells.selectedValue) {
						return "images/rvn.png";
					} else {
						return (data.rows.sort.asc ? "images/rvd.png" : "images/rvu.png");
					}
				}
			};

			obj
					.html('<div class="heatmap-loader"><div class="background"></div><div class="progress"><img src="images/loading.gif"></div></div>');

			var table = $("<table>", {
				"class" : "heatmap"
			});

			// table header
			var header = $("<thead>");
			table.append(header);

			var borderTop = $('<tr>', {
				'class' : 'border'
			});
			borderTop.append($('<td>'));

			var topToolbar = $("<td>", {
				'colspan' : (this.cols.order.length + 1)
			});

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
				'src' : "images/sep.png"
			}));

			// Zoom cols -
			topToolbar.append($('<img>', {
				'src' : "images/z_less.png"
			}).click(function() {
				data.cols.zoom = data.cols.zoom - 3;
				data.zoom();
			}));

			// Zoom cols +
			topToolbar.append($('<img>', {
				'src' : "images/z_plus.png"
			}).click(function() {
				data.cols.zoom = data.cols.zoom + 3;
				data.zoom();
			}));

			borderTop.append(topToolbar);
			header.append(borderTop);

			var firstRow = $("<tr>");
			header.append(firstRow);

			var leftToolbar = $('<th>', {
				'class' : 'border'
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
				'src' : "images/sep.png"
			}));

			// Zoom rows -
			leftToolbar.append($('<img>', {
				'src' : "images/z_less.png"
			}).click(function() {
				data.rows.zoom = data.rows.zoom - 3;
				data.zoom();
			}));
			leftToolbar.append($('<br>'));

			// Zoom rows +
			leftToolbar.append($('<img>', {
				'src' : "images/z_plus.png"
			}).click(function() {
				data.rows.zoom = data.rows.zoom + 3;
				data.zoom();
			}));
			leftToolbar.append($('<br>'));

			var selectors = $("<th>", {
				"class" : "topleft"
			});
			firstRow.append(selectors);

			// Add filters

			for (filterId in data.filters) {

				var filterDef = data.filters[filterId];

				if (filterDef.fields.indexOf(data.cells.selectedValue) > -1) {

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

					selectors.append($('<div>', {
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
			selectors.append(selectCol);
			for ( var o = 0; o < this.cols.header.length; o++) {
				selectCol.append(new Option(this.cols.header[o], o, o == this.cols.selectedValue));
			}
			selectCol.val(this.cols.selectedValue);
			selectors.append($("<span>Columns</span>"));
			selectors.append($("<br>"));

			// Add row selector
			var selectRow = $("<select>").change(function() {
				var value = $(this)[0].value;
				data.rows.selectedValue = value;
				data.loading(function() {
					data.paint(obj);
				});
			});
			selectors.append(selectRow);
			selectors.append($("<span>Rows</span>"));
			selectors.append($("<br>"));

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
			selectors.append(selectCell);
			selectors.append($("<span>Cells</span>"));
			selectors.append($("<br>"));

			for ( var o = 0; o < this.cells.header.length; o++) {
				selectCell.append(new Option(this.cells.header[o], o, o == this.cells.selectedValue));
			}
			selectCell.val(this.cells.selectedValue);

			// Add column headers
			for ( var c = 0; c < data.cols.order.length; c++) {

				var colHeader = $("<th><div class='col'>" + data.getColValueSelected(c) + "</div></th>");

				colHeader.click(function() {
					var col = $(this).parent().children().index($(this)) - 2;
					data.loading(function() {
						data.sortRowsByCol(col, !data.rows.sort.asc);
						data.paint(obj);
					});
				});

				firstRow.append(colHeader);
			}

			// Add row annotations headers
			var rowspan = 1 + data.cols.annotations.length;

			if (data.rows.annotations.length > 0) {
				firstRow.append("<th class='borderRL' rowspan='" + rowspan + "'>&nbsp;</th>");
			}

			for ( var a = 0; a < data.rows.annotations.length; a++) {
				var index = data.rows.annotations[a];
				var annotationTitle = $("<th rowspan='" + rowspan + "'><div class='col'>" + data.rows.header[index]
						+ "</div></th>");
				annotationTitle.click(function() {
					var col = $(this).parent().children().index($(this)) - 3 - data.cols.order.length;
					var a = data.rows.annotations[col];
					data.loading(function() {
						data.sortRowsByLabel(a, !data.rows.sort.asc);
						data.paint(obj);
					});
				});

				firstRow.append(annotationTitle);
			}

			firstRow.append("<th class='borderL' rowspan='" + rowspan + "'>&nbsp;</th>");

			// Add column annotations
			var lastRow = firstRow;
			for ( var a = 0; a < data.cols.annotations.length; a++) {
				var index = data.cols.annotations[a];
				lastRow = $("<tr>", {
					'class' : 'annotations'
				});
				lastRow.append("<th class='border'>");

				var annotationTitle = $("<th class='title'>");
				annotationTitle.html(data.cols.header[index]);
				annotationTitle.click(function() {
					var a = data.cols.annotations[($(this).parent().parent().children().index($(this).parent()) - 2)];
					data.loading(function() {
						data.sortColsByLabel(a, !data.cols.sort.asc);
						data.paint(obj);
					});
				});
				lastRow.append(annotationTitle);

				for ( var c = 0; c < data.cols.order.length; c++) {
					var cell = $(data.cols.decorators[index].call(this, data.getColValue(c, index)));

					if (data.tooltip) {
						var tooltipContent = "";
						$.each(data.cols.header, function(i, value) {
							if (i == index) {
								tooltipContent += "<span style='color:red;'><strong>" + value + "</strong>: "
										+ data.getColValue(c, i) + "</span><br />";
							} else {
								tooltipContent += "<strong>" + value + "</strong>: " + data.getColValue(c, i)
										+ "<br />";
							}
						});

						cell.qtip({
							content : tooltipContent,
							position : {
								my : 'top left',
								at : 'bottom left'
							}
						});
					}

					lastRow.append(cell);
				}
				header.append(lastRow);
			}

			// Table body
			var body = $("<tbody>");
			table.append(body);

			var firstCell;
			for ( var r = 0; r < data.rows.order.length; r++) {

				// Add row header
				var tableRow = $('<tr>');
				firstCell = $('<td>', {
					'class' : 'border'
				});
				tableRow.append(firstCell);

				var cell = $("<td>", {
					"class" : "row"
				}).append($("<div>").html(data.getRowValueSelected(r)));

				cell.click(function() {
					var row = $(this).parent().parent().children().index($(this).parent());
					data.loading(function() {
						data.sortColsByRow(row, !data.cols.sort.asc);
						data.paint(obj);
					});
				});

				tableRow.append(cell);

				// Add cell values
				for ( var c = 0; c < data.cols.order.length; c++) {

					var cell = $(data.cells.decorators[data.cells.selectedValue].call(this, data.getCellValueSelected(
							r, c)));

					if (data.tooltip) {
						var tooltipContent = "";
						$.each(data.cells.header, function(i, value) {
							if (i == data.cells.selectedValue) {
								tooltipContent += "<span style='color:red;'><strong>" + value + "</strong>: "
										+ data.getCellValue(r, c, i) + "</span><br />";
							} else {
								tooltipContent += "<strong>" + value + "</strong>: " + data.getCellValue(r, c, i)
										+ "<br />";
							}
						});

						cell.qtip({
							content : tooltipContent,
							position : {
								my : 'top left',
								at : 'bottom left'
							}
						});
					}

					tableRow.append(cell);
				}

				if (data.rows.annotations.length > 0) {
					tableRow.append("<td class='borderRL'>&nbsp;</td>");
				}

				// Add row annotations
				for ( var a = 0; a < data.rows.annotations.length; a++) {
					var index = data.rows.annotations[a];

					var cell = $(data.rows.decorators[index].call(this, data.getRowValue(r, index)));
					cell.attr("class", "ra");

					if (data.tooltip) {
						var tooltipContent = "";
						$.each(data.rows.header, function(i, value) {
							if (i == index) {
								tooltipContent += "<span style='color:red;'><strong>" + value + "</strong>: "
										+ data.getRowValue(r, i) + "</span><br />";
							} else {
								tooltipContent += "<strong>" + value + "</strong>: " + data.getRowValue(r, i)
										+ "<br />";
							}

						});
						cell.qtip({
							content : tooltipContent,
							position : {
								my : 'top left',
								at : 'bottom left'
							}
						});
					}

					tableRow.append(cell);
				}

				tableRow.append("<td class='borderL'>&nbsp;</td>");

				body.append(tableRow);
			}

			// Add last border row
			var endRow = $('<tr>');
			endRow.append("<td class='border'></td>");
			endRow.append("<td class='borderT' colspan='" + (data.cols.order.length + 1) + "'></td>");
			endRow.append("<td class='border'></td>");
			if (data.rows.annotations.length > 0) {
				endRow.append("<td class='borderT' colspan='" + (data.rows.annotations.length) + "'></td>");
			}
			body.append(endRow);

			obj.append(table);

			data.zoom();
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
			$.get(csvFile, function(data) {
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
									valuesRow.push(parseFloat(textValues[i]));
								}
							} else {
								valuesRow = line.splitCSV(sep);
							}
							result.values.push(valuesRow);
						}
					}
				});
			});
		},

		// Load all the data files.
		load : function(data, rowFile, colFile, valuesFile, sep) {
			data.sync = false;
			methods['readfile'].call(this, rowFile, sep, data.rows, false);
			methods['readfile'].call(this, colFile, sep, data.cols, false);
			methods['readfile'].call(this, valuesFile, sep, data.cells, false);
		},

		init : function(rowFile, colFile, valuesFile, options) {
			var obj = $(this);
			obj
					.html('<div class="heatmap-loader"><div class="background"></div><div class="progress"><img src="images/loading.gif"></div></div>');
			obj.ajaxStop(function() {
				if (!data.sync) {

					data.loading(function() {

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
			methods['load'].call(this, data, rowFile, colFile, valuesFile, options.separator);

		}

	};

	// Main function that creates the heatmap
	$.fn.heatmap = function(rowFile, colFile, valuesFile, options) {
		var defaults = {
			separator : ",",
			init : function(heatmap) {
			}
		};
		var options = $.extend(defaults, options);
		return this.each(methods['init'].call(this, rowFile, colFile, valuesFile, options));
	};

})(jQuery);