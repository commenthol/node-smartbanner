"use strict";

var request = require('request');
var config = require('../config');

var M = {};

/**
 * issue a backend request to the store URL
 * 
 * @param {String} url
 * @param {Function} callback : function requires callback(error, body) 
 */
M.request = function(url, callback) {
	
		var options = {
			url: url,
			headers: {
				'User-Agent': '-',
				'Accept-Language': config.acceptLanguage,
				'Accept': 'text/html',
			}
		};
		
		request(options, function(error, response, body){

			if (!error && response.statusCode == 200) {
				callback(error, body);
			}
			else {
				callback(error);
			}
		});
	};

module.exports = M;
