(function($) {
	'use strict';
	var $chart = $('#stock-chart'),
		$list = $('#stock-list'),
		$form = $('#stock-form'),
		$addInput = $('#add-input'),
		socket = io();
	$form.on('submit', onAddStock);
	$('body').on('click', '.stock-item .btn', onRemoveStock);
	socket.on('addStock', onStockAdded);
	socket.on('removeStock', onStockRemoved);
	socket.on('exception', onSocketError);
	getStocks();

	function createChart(data) {
		Highcharts.stockChart('stock-chart', {
			rangeSelector: {
				selected: 4
			},
			yAxis: {
				labels: {
					formatter: function() {
						return (this.value > 0 ? ' + ' : '') + this.value + '%';
					}
				},
				plotLines: [{
					value: 0,
					width: 2,
					color: 'silver'
				}]
			},
			plotOptions: {
				series: {
					compare: 'percent',
					showInNavigator: true
				}
			},
			tooltip: {
				pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br>',
				valueDecimals: 2,
				split: true
			},
			series: data
		});
	}

	function createStockList(data) {
		$.each(data, function(i, item) {
			var $item = createStockItem(item);
			$list.append($item);
		});
	}

	function createStockItem(data) {
		var html = '';
		html += '<div class="stock-item" id="stock-' + data.name + '">';
		html += '<div class="btn btn-default btn-block">';
		html += '<strong class="stock-title">' + data.name + '</strong>';
		html += '<span class="stock-desc">' + data.description + '</span>';
		html += '<span class="close">&times;</span>';
		html += '</div>';
		html += '</div>';
		return $(html);
	}

	function getStocks() {
		$.getJSON('/all', function(data) {
			if (data.err) {
				$chart.replaceWith('<div class="alert alert-danger">' + data.err.message + '<br><br><strong>Wait a moment then try again.</strong></div>');
				throw data.err.message;
			} else {
				createChart(data.stocks);
				createStockList(data.stocks);
			}
		});
	}

	function onAddStock(event) {
		event.preventDefault();
		var symbol = $addInput.val().toUpperCase();
		if (symbol === '') {
			alert('Provide a valid stock code before submitting');
			return;
		}
		$addInput.val('');
		$addInput.attr('disabled', true);
		socket.emit('addStock', symbol);
	}

	function onRemoveStock() {
		var self = $(this).parent();
		var symbol = self.find('.stock-title').text();
		socket.emit('removeStock', symbol);
	}

	function onSocketError(err) {
		alert(err.message);
	}

	function onStockAdded(data) {
		var $item = createStockItem(data);
		$addInput.attr('disabled', false);
		$list.append($item.hide().fadeIn());
	}

	function onStockRemoved(symbol) {
		var $target = $('#stock-' + symbol);
		if ($target.length) {
			$target.fadeOut(300, $target.remove);
		}
	}
})(jQuery);