"use strict";

var util   = require('./util.js');
var config = require('../config.js');

var M = {};

/**
 * issue a backend request to retrieve the smartbanner html
 */
M = function (req, res, next) {
	
	var url = req.url;
	var log = req.log || {};
	var key;
	var a = [];
	var i;

	for (i in config.type) {
		// obtain key attributes from url
		if (url.indexOf('/'+ i +'/') > 0) {
			a = url.match('/('+ i +')/([^\/]+)/?$');
			if (a && a.length === 3) {
				key = {
					type:  a[1],
					appId: a[2]
				};
			}
			break;
		}
	}

	if (key) {
		util.smartbanner(key, function(error, html){

			if (error) {
				if (log.error) log.error(error);
			}
			if (html) {
				res.send(html);
				return;
			}
			res.send(404);
			return;
		});
	}
	else {
		res.send(404);
	}
};

module.exports = M;
