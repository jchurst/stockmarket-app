const Quandl = require('quandl');
const Stock = require('../models/stock');
module.exports = (io, socket) => {
	socket.on('addStock', symbol => {
		const quandl = new Quandl();
		quandl.configure({
			auth_token: process.env.QUANDL_API_KEY
		});
		let date = new Date();
		const end_date = date.toISOString().substring(0, 10);
		date.setYear(date.getYear() - 1);
		const start_date = date.toISOString().substring(0, 10);
		quandl.dataset({
			source: 'WIKI',
			table: symbol.toUpperCase()
		}, {
			order: 'asc',
			start_date,
			end_date,
			column_index: 4,
			exclude_column_names: true
		}, (err, response) => {
			if (err) throw err;
			const d = JSON.parse(response);
			if (d.quandl_error) return socket.emit('exception', d.quandl_error);
			const name = d.dataset.dataset_code;
			const description = d.dataset.name;
			const data = d.dataset.data.map(item => [(new Date(item[0])).getTime(), item[1]]); // [Time, Float]
			const stockObj = {
				name,
				description,
				data
			};
			const newStock = new Stock(stockObj);
			Stock.update(stockObj, {
				$setOnInsert: newStock
			}, {
				upsert: true
			}, (err, result) => {
				if (err) throw err;
				io.sockets.emit('addStock', stockObj);
			});
		});
	});
	socket.on('removeStock', symbol => {
		Stock.findOneAndRemove({
			name: symbol
		}, (err, result) => {
			if (err) throw err;
			io.sockets.emit('removeStock', symbol);
		});
	});
};