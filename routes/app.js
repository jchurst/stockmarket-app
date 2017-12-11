const express = require('express');
const router = express.Router();
const Quandl = require('quandl');
const Stock = require('../models/stock');
router.get('/', (req, res) => res.render('index.html'));
router.get('/all', (req, res) => {
	Stock.find({}, (err, stocks) => {
		if (err) throw err;
		res.json({
			stocks
		});
	});
});
module.exports = router;