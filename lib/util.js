/*
 * 
 */

"use strict";

var backend = require('./backend.js');
var cache   = require('./cache.js');
var extract = require('./extract.js');
var config  = require('../config.js');


/**
 * Module variables
 */
var _M = {}; // internal module
var  M = {}; // module to export

module.exports = M;

_M = function(key) {
	
	var self = {};

	self.hasKey = function () {
		return key && key.type && key.appId;
	};
	
	self.replace = function (url) {
		return url
			.replace(/#language#/, config.language)
			.replace(/#appId#/, key.appId);
	};

	self.storeUrl = function () {
		if (config.type && config.type[key.type]) {
			return self.replace(config.type[key.type].store || "");
		}
	};
	
	self.appUrl = function() {
		if (config.type && config.type[key.type]) {
			return self.replace(config.type[key.type].app || "");
		}
	};

	self.appText = function () {
		if (config.type && config.type[key.type]) {
			return config.type[key.type].text || "";
		}
	};
	
	self.html = function (obj) {
		var html;
		var rating = 0;
		
		if (obj && obj.image && obj.title && obj.developer && obj.price && obj.rating) {
			
			if (obj.rating > 0) {
				rating = obj.rating;
			}
			
			html =
				'<div id="smartbanner"' + (key.type === 'windowsphone' ? ' class="windows"' : '') + '>'+
					'<a href="#" class="sb-close">' + (key.type === 'windowsphone' ? config.closeButtonText : '×' ) + '</a>'+
					'<span class="sb-icon" style="background-image: url('+ obj.image +');"></span>'+
					'<div class="sb-info">'+
						'<strong>'+ obj.title +'</strong><span>'+ obj.developer +'</span>' +
						'<span class="sb-stars">' +
							'<span class="sb-rating" style="width:'+ rating +'%">★★★★★</span>' + 
							(key.type === 'windowsphone' ? '★★★★★' : '☆☆☆☆☆' ) +
						'</span>' + 
						'<span>' + obj.price + ' ‒ ' + self.appText() + '</span>'+
					'</div>'+
					'<a href="' + self.appUrl() + '" class="sb-button"><span>' + config.viewButtonText + '</span></a>'+
				'</div>';

		}
		return html;
	};

	function request(callback) {
		var storeUrl = self.storeUrl();
		var obj;

		if (storeUrl) {
			backend.request(storeUrl, function(error, data){
				if (!error && data) {
					obj = extract(key.type, data);
					if (obj) {
						// check that no value is undefined
						for (var i in obj) {
							if (obj[i] === undefined || obj[i] === null) {
								error = new Error('undefined extraction value ' + i + 'using url ' + storeUrl);
								break;
							}
						}
						if (!error) {
							cache.set(key, obj, config.timeout);
						}
					}
				}
				if (error) {
					// try to obtain obj from cache
					obj = cache.get(key);
					cache.setTimeout(key, config.timeoutOnError || config.timeout);
				}
				callback(error, obj);
				return;
			});
		} 
		else {
			callback(new Error('no Store URL specified in config for ' + key.type));
		}
	}
	
	self.smartbanner = function (callback) {
		var html;
		var obj;

		if (self.hasKey()) {

			if (cache.expired(key)) {
				request(function(error, obj){
					var html;
					if (obj) {
						html = self.html(obj);
					}
					callback(error, html);
				});
			}
			else {
				obj = cache.get(key);
				html = self.html(obj);
				callback(null, html);
				return;
			}
		}
		else {
			callback(new Error('bad key values'));
		}
	};

	return self;
};

/**
 * obtain data from the cache if present.
 * otherwise issue a request
 * if extracted data by `type` is available fill the template and return 
 * it.
 * 
 * @param {Object} key 
 * @property {String} key.type
 * @property {String} key.appId
 * 
 * @return {String} smartbanner response
 */
M.smartbanner = function(key, callback){
	
	_M(key).smartbanner(callback);
	
};

/**
 * get cached obj - required for tests
 * 
 * @param {Object} key 
 * @property {String} key.type
 * @property {String} key.appId
 * 
 * @return {Object}
 */
M._getCache = function(key) {
	return cache.get(key);
};
