"use strict";

var util = require('./util.js');

var M = {};

/**
 * issue a backend request to retrieve the smartbanner html
 */
M = function (req, res, next) {
	
	util.smartbanner(req, function(error, html){
		if (!error && html) {
			res.send(html);
			return;
		}
		res.send(404);
		return;
	});

};

//~ module.exports = { middlewares: [ M.cache, M.request, M.end ] };
module.exports = M;
