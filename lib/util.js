"use strict";

var cheerio = require('cheerio');
var backend = require('./backend.js');
var config  = require('../config.js');

var cache = { timeout: {} };

var  M = {}; // module to export
var _M = {}; // internal module

var extract = {
	ios: {
		title: function($) {
			var value;
			value = $('#title .left h1').text();
			return value;
		},
		image: function($) {
			var value;
			value = $('#left-stack .artwork img').attr('src');
			return value;
		},
		developer: function($) {
			var value;
			debugger;
			value = $('#left-stack ul.list').eq(0).find('li').eq(6).text();
			if (value) {
				value = value.replace(/^[^:]+:\s*(.*)$/, '$1').trim();
			}
			return value;
		},
		rating:  function($) {
			var stars = { 
				"null": 0, 
				"halber": 0.5,
				"ein": 1,
				"eineinhalb": 1.5,
				"zwei": 2, 
				"zweieinhalb": 2.5, 
				"drei": 3, 
				"dreieinhalb": 3.5, 
				"vier": 4, 
				"viereinhalb": 4.5, 
				"fünf": 5 
			};
			var value;
			var txt;
			for (var i=1; i>=0; i-=1) {
				txt = $('#left-stack div.rating').eq(i).attr('aria-label');
				if (txt) break;
			}
			if (txt) {
				console.log(txt);
				txt = txt.replace(/^(.*) Stern.*$/, '$1').toLowerCase();
				if (stars[txt]) {
					value = stars[txt] * 100 / 5;
				}
			}
			return value;
		},
		price: function($) {
			var value;
			value = $('#left-stack div.price').text();
			return value;
		},
	},
	android: {
		title: function($) {
			var value;
			value = $('.document-title div').text();
			return value;
		},
		image: function($) {
			var value;
			value = $('.details-info img.cover-image').attr('src');
			if (value) {
				value = value.replace(/\=w300$/, '=w114');
			}
			return value;
		},
		developer: function($) {
			var value;
			debugger;
			value = $('[itemprop=author] .document-subtitle.primary').text();
			return value;
		},
		rating:  function($) {
			var value;
			value = parseFloat($('.stars-container .current-rating').css('width'));
			return value;
		},
		price: function($) {
			var value;
			value = $('.price [itemprop=price]').attr('content');
			return value;
		},
	},
	windowsphone: {
		title: function($) {
			var value;
			value = $('#application h1').text();
			return value;
		},
		image: function($) {
			var value;
			value = $('#application img.appImage').attr('src');
			if (value) {
				value = value.replace(/\=ws_icon_large/, '=ws_icon_small');
			}
			return value;
		},
		developer: function($) {
			var value;
			debugger;
			value = $('#publisher [itemprop=publisher]').text();
			return value;
		},
		rating:  function($) {
			var value;
			value = parseFloat($('#rating [itemprop=ratingValue]').attr('content'));
			if (value) {
				value = value * 100 / 5;
			}
			return value;
		},
		price: function($) {
			var value;
			value = $('#offer [itemprop=price]').text();
			return value;
		},
	}
};

/**
 * check if required `req` attributes are present.
 */
_M.hasReqAttributes = function(req) {
	var opt = req.body;
	return opt && opt.type && opt.appId;
};

/**
 * get the right store URL depending on the required type and appId
 *
 * @param {Object} req 
 * @property {String} req.body.type
 * @property {String} req.body.appId
 */
_M.getStoreUrl = function(req) {
	var conf;
	var opt;
	
	if (_M.hasReqAttributes(req)) {
		opt = req.body;

		if (config && config[opt.type]) {
			conf = config[opt.type].store;
			conf = conf
				.replace(/#language#/, config.language)
				.replace(/#appId#/, opt.appId);
				
			return conf;
		}
	}
};

/**
 * get the right application URL depending on the required type and appId
 *
 * @param {Object} req 
 * @property {String} req.body.type
 * @property {String} req.body.appId
 */
_M.getAppUrl = function(req) {
	var conf;
	var opt;
	
	if (_M.hasReqAttributes(req)) {
		opt = req.body;

		if (config && config[opt.type]) {
			conf = config[opt.type].app;
			conf = conf
				.replace(/#language#/, config.language)
				.replace(/#appId#/, opt.appId);
				
			return conf;
		}
	}
};

/**
 * get the right appstore text depending on the required type
 *
 * @param {Object} req 
 * @property {String} req.body.type
 */
_M.getText = function(req) {
	var conf;
	var opt;
	
	if (_M.hasReqAttributes(req)) {
		opt = req.body;

		if (config && config[opt.type]) {
			conf = config[opt.type].text;
			return conf;
		}
	}
};

/**
 * render the smartbanner for the xhr response
 * 
 * @param {Object} req 
 * @property {String} req.body.type
 * @property {String} req.body.appId
 * @param {Object} obj : the extracted values from the backend request 
 * @return {String}
 */
_M.smartbannerHtml = function(req, obj){
	var html = "";
	
	if (_M.hasReqAttributes(req) && obj) {
		html =
			'<div id="smartbanner">'+
				'<a href="#" class="sb-close">×</a>'+
				'<span class="sb-icon" style="background-image: url('+ obj.image +');"></span>'+
				'<div class="sb-info">'+
					'<strong>'+ obj.title +'</strong><span>'+ obj.developer +'</span>'+
					'<span class="sb-stars"><span class="sb-rating" style="width:' + obj.rating + '%"> </span> </span>'+
					'<span>' + obj.price + ' - ' + _M.getText(req) + '</span>'+
				'</div>'+
				'<a href="' + _M.getAppUrl(req) + '" class="sb-button"><span>' + config.viewButtonText + '</span></a>'+
			'</div>';
	}
	return html;
};

/**
 * parse the dom from `body` and extract the field values according to `type`.
 * on success the results are stored in internal cache.
 * 
 * @param {Object} req 
 * @property {String} req.body.type
 * @property {String} req.body.appId
 * @param {String} body : the data from the backend request
 */
_M.extract = function(req, body) {
	var $;
	var i;
	var j;
	var log = req.log || {};
	var obj = {};
	
	$ = cheerio.load(body);

	if (_M.hasReqAttributes(req)) {
		obj.image     = extract[req.body.type].image($);
		obj.title     = extract[req.body.type].title($);
		obj.developer = extract[req.body.type].developer($);
		obj.rating    = extract[req.body.type].rating($) || 0;
		obj.price     = extract[req.body.type].price($);
		if (/Gratis|Free|Kostenlos/i.test(obj.price)) {
			obj.price = config.viewFreeText;
		}
		
		j = true;
		for (i in obj) {
			if (obj[i] === undefined || obj[i] === null) {
				j = false;
			}
			else {
				obj[i] = _M.sanitize(obj[i]);
			}
		}
		if (j) {
			_M.setCache(req, obj);
		} 
		else {
			log.error && log.error(obj);
			obj = null;
		}
		log.debug && log.debug(obj);
		
		return obj;
	}

	return;
}

/**
 * strip off any possible html tags which might get included afterwards
 *
 * @param {String} value
 * @return {String} sanitized value
 */
_M.sanitize = function(value) {
	if (typeof(value) === 'string') {
		value = value
			.replace(/[\r\n]/mg, '')
			.replace(/\s+/mg, ' ')
			.replace(/<[^>]*>/mg, '')
			.replace(/<[^>]*$/mg, '')
			.replace(/^[^>]*>/mg, '');
	}
	return value;
}

/**
 * issue a backend request to store URL according to `type`.
 *
 * @param {Object} req 
 * @property {String} req.body.type
 * @param {Function} callback : callback function called on error or success
 * @property {Object} callback.error : error object
 * @property {Object} callback.data : parsed data object
 */
_M.request = function(req, callback) {
	var obj;
	var log = req.log || {};
	var url = _M.getStoreUrl(req);
	var html;

	if (url) {
		backend.request(url, function(error, data){
			if (!error && data) {
				obj = _M.extract(req, data);
				html = _M.smartbannerHtml(req, obj);
				callback(error, html);
			}
			else {
				log.error(__filename + ' .request ' + url + ' failed');
				callback(error);
			}
		});
	}
};

/**
 * obtain data from the cache if present.
 * otherwise issue a request
 * if extracted data by `type` is available fill the template and return 
 * it.
 * 
 * @param {Object} req 
 * @property {String} req.body.type
 * @property {String} req.body.appId
 * @param {Function} callback :  
 * 
 * @return {String} smartbanner response
 */
_M.getCache = function(req, callback) {
	var opt = req.body;
	var date = Date.now() / 1000;

	if (_M.hasReqAttributes(req)) {
		
		if (!cache.timeout) {
			cache.timeout = {};
		}
		if (!cache.timeout[opt.type]) {
			cache.timeout[opt.type] = {};
		}
		if (!cache.timeout[opt.type][opt.appId]) {
			cache.timeout[opt.type][opt.appId] = 0;
		}
		
		console.log(date);
		console.log(cache.timeout[opt.type][opt.appId]);
		
		if (date > cache.timeout[opt.type][opt.appId] ) {
			_M.request(req, function(error, html) {
				if (!error) {
					cache.timeout[opt.type][opt.appId] = date + config.timeout;
				}
				callback(error, html);
			});
			return;
		}

		if (cache[opt.type] && cache[opt.type][opt.appId]) {
			callback(null, _M.smartbannerHtml(req, cache[opt.type][opt.appId]) );
			return;
		}
	}
	
	callback(true);
	return; 
};

/**
 * set the cache with the obtained extracted values according to `type` 
 * and `appId`
 * 
 * @param {Object} req 
 * @property {String} req.body.type
 * @property {String} req.body.appId
 */
_M.setCache = function(req, obj) {
	var opt = req.body;

	if (_M.hasReqAttributes(req)) {
		if (! cache[opt.type]) {
			cache[opt.type] = {};
		}
		cache[opt.type][opt.appId] = obj;
		return true;
	}
	
	return false;
};

/**
 * obtain data from the cache if present.
 * otherwise issue a request
 * if extracted data by `type` is available fill the template and return 
 * it.
 * 
 * @param {Object} req 
 * @property {String} req.body.type
 * @property {String} req.body.appId
 * 
 * @return {String} smartbanner response
 */
M.smartbanner = _M.getCache;

module.exports = M;
