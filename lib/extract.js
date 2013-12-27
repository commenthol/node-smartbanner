/*
 * extract
 */

"use strict";

var cheerio = require('cheerio');
var config  = require('../config.js');

var _M = {};
var  M = {};

/**
 * extraction rules for the different types
 */
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
			value = $('#left-stack ul.list').eq(0).find('li').eq(6).text();
			if (value) {
				value = value.replace(/^[^:]+:\s*(.*)$/, '$1').trim();
			}
			return value;
		},
		rating: function($) {
			var value;
			var rating = $('#left-stack div.rating').eq(0);
			var stars = $(rating).find('> .rating-star').length;
			var half  = $(rating).find('> .rating-star.half').length;
			var ghost = $(rating).find('> .rating-star.ghost').length;
			
			if (stars) {
				value = (stars - ghost - (half * 0.5)) * (100 / stars);
			}
			return value;
		},
		count: function($) {
			var value = $('#left-stack div.rating').eq(0).find('> .rating-count').text();
			if (value) {
				value = value.replace(/[^0-9]/g, '');
				value = parseInt(value, 10);
				if (isNaN(value)) {
					value = undefined;
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
			value = $('[itemprop=author] .document-subtitle.primary').text();
			return value;
		},
		rating:  function($) {
			var value;
			value = parseInt($('.header-star-badge .stars-container .current-rating').css('width'), 10);
			return value;
		},
		count: function($) {
			var value;
			value = $('.header-star-badge .stars-count').text();
			if (value) {
				value = value.replace(/[^0-9]/g, '');
				value = parseInt(value, 10);
				if (isNaN(value)) {
					value = undefined;
				}
			}
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
			value = $('#publisher [itemprop=publisher]').text();
			return value;
		},
		rating:  function($) {
			var value;
			value = $('#rating [itemprop=ratingValue]').attr('content');
			if (value) {
				value = value.replace(/,/, '.');
				value = parseFloat(value, 10);
				if (isNaN(value)) {
					value = undefined;
				}
				else {
					value = value * 100 / 5;
				}
			}
			return value;
		},
		count: function($) {
			var value;
			value = parseInt($('#rating [itemprop=ratingCount]').attr('content'), 10);
			if (isNaN(value)) {
				value = undefined;
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
 * Parse the dom from `body` and extract the field values according to `type`.
 * 
 * @param  {String} type
 * @param  {String} body : the data from the backend request
 * @return {Object} extracted object
 */
M.extract = function(type, body) {
	var $;
	var i;
	var obj = {};
	
	if (! extract[type]) {
		return;
	}
	
	$ = cheerio.load(body);

	obj.image     = extract[type].image($);
	obj.title     = extract[type].title($);
	obj.developer = extract[type].developer($);
	obj.rating    = extract[type].rating($) || -1;
	obj.count     = extract[type].count($) || -1;
	obj.price     = extract[type].price($);
	if (config.freeText.regex.test(obj.price)) {
		obj.price = config.freeText.view;
	}
	
	for (i in obj) {
		obj[i] = M._sanitize(obj[i]);
	}
	
	return obj;
};

/**
 * strip off any possible html tags which might get included afterwards
 *
 * @param {String} value
 * @return {String} sanitized value
 */
M._sanitize = function(value) {
	if (typeof(value) === 'string') {
		value = value
			.replace(/[\r\n]/mg, '')
			.replace(/\s+/mg, ' ')
			.replace(/<[^>]*>/mg, '')
			.replace(/<[^>]*$/mg, '')
			.replace(/^[^>]*>/mg, '');
	}
	return value;
};

module.exports = M.extract;
