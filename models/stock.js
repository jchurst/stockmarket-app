const mongoose = require('mongoose');
const StockSchema = new mongoose.Schema({
	name: {
		type: String,
		unique: true
	},
	description: String,
	data: Array
});
module.exports = mongoose.model('Stock', StockSchema);