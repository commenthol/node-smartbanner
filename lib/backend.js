"use strict";

var request = require('request');
var _       = require('lodash');
var config  = require('../config');

var M = {};

/**
 * issue a backend request to the store URL
 * 
 * @param {String} url
 * @param {Function} callback : function requires callback(error, body) 
 */
M.request = function(url, callback) {

		var options = _.assign({
			url: url,
		}, config.backend);
		
		request(options, function(error, response, body){

			if (!error && response.statusCode == 200) {
				callback(error, body);
			}
			else {
				if (response && response.statusCode) {
					error = new Error(response.statusCode + ' ' + url);
				}
				else {
					error = new Error(error.message + ' ' + url);
				}
				callback(error);
			}
		});
	};

module.exports = M;
