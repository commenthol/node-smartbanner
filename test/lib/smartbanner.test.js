/*
 * smartbanner tests
 */
 
"use strict";

var vows   = require('vows');
var assert = require('assert');
var util  = require('../../lib/util.js');

vows.describe('smartbanner tests')
.addBatch({
	'scrape itunes' : {
		topic: function() {
			var self = this;
			var key = {
				type: 'ios',
				appId: '725989866'
			};
			util.smartbanner(key, function(error, html){
				self.callback(error, html, key);
			});
		},
		'returns no error': function(error, html, key) {
			assert.ifError(error);
		},
		'returns html snippet': function(error, html, key) {
			assert.ok(/<div id="smartbanner"/.test(html));
		},
		'check cached element': function(error, html, key) {
			var cached = util._getCache(key); 
			
			assert.ok(typeof(cached.image) === 'string');
			assert.ok(typeof(cached.developer) === 'string');
			assert.ok(typeof(cached.rating) === 'number');
			assert.ok(typeof(cached.count) === 'number');
			assert.ok(typeof(cached.price) === 'string');
			
			assert.ok(/^https?:\/\//.test(cached.image));
		}
	},
	'scrape googleplay' : {
		topic: function() {
			var self = this;
			var key = {
				type: 'android',
				appId: 'com.crowdstar.avatar'
			};
			util.smartbanner(key, function(error, html){
				self.callback(error, html, key);
			});
		},
		'returns no error': function(error, html, key) {
			assert.ifError(error);
		},
		'returns html snippet': function(error, html, key) {
			assert.ok(/<div id="smartbanner"/.test(html));
		},
		'check cached element': function(error, html, key) {
			var cached = util._getCache(key); 
			
			assert.ok(typeof(cached.image) === 'string');
			assert.ok(typeof(cached.developer) === 'string');
			assert.ok(typeof(cached.rating) === 'number');
			assert.ok(typeof(cached.count) === 'number');
			assert.ok(typeof(cached.price) === 'string');
			
			assert.ok(/^https?:\/\//.test(cached.image));
		}
	},
	'scrape windows store' : {
		topic: function() {
			var self = this;
			var key = {
				type: 'windowsphone',
				appId: '37527bf3-5820-43e5-9ae3-be310466fea4'
			};
			util.smartbanner(key, function(error, html){
				self.callback(error, html, key);
			});
		},
		'returns no error': function(error, html, key) {
			assert.ifError(error);
		},
		'returns html snippet': function(error, html, key) {
			assert.ok(/<div id="smartbanner"/.test(html));
		},
		'check cached element': function(error, html, key) {
			var cached = util._getCache(key); 
			
			assert.ok(typeof(cached.image) === 'string');
			assert.ok(typeof(cached.developer) === 'string');
			assert.ok(typeof(cached.rating) === 'number');
			assert.ok(typeof(cached.count) === 'number');
			assert.ok(typeof(cached.price) === 'string');
			
			assert.ok(/^https?:\/\//.test(cached.image));
		}
	},
})
.addBatch({
	'scrape itunes with bad appId' : {
		topic: function() {
			var self = this;
			var key = {
				type: 'ios',
				appId: 'com.crowdstar.avatar'
			};
			util.smartbanner(key, function(error, html){
				self.callback(error, html, key);
			});
		},
		'returns error': function(error, html, key) {
			assert.ok(error);
			assert.isNotNull(error);
		},
		'returns no html snippet': function(error, html, key) {
			assert.ok(! /<div id="smartbanner"/.test(html));
		},
		'check cached element': function(error, html, key) {
			var cached = util._getCache(key); 
			assert.isUndefined(cached);
		}
	},
	'scrape google play with bad appId' : {
		topic: function() {
			var self = this;
			var key = {
				type: 'android',
				appId: '725989866'
			};
			util.smartbanner(key, function(error, html){
				self.callback(error, html, key);
			});
		},
		'returns error': function(error, html, key) {
			assert.ok(error);
			assert.isNotNull(error);
		},
		'returns no html snippet': function(error, html, key) {
			assert.ok(! /<div id="smartbanner"/.test(html));
		},
		'check cached element': function(error, html, key) {
			var cached = util._getCache(key); 
			assert.isUndefined(cached);
		}
	},
	'scrape windowsstore with bad appId' : {
		topic: function() {
			var self = this;
			var key = {
				type: 'windowsphone',
				appId: '725989866'
			};
			util.smartbanner(key, function(error, html){
				self.callback(error, html, key);
			});
		},
		'returns error': function(error, html, key) {
			assert.ok(error);
			assert.isNotNull(error);
		},
		'returns no html snippet': function(error, html, key) {
			assert.ok(! /<div id="smartbanner"/.test(html));
		},
		'check cached element': function(error, html, key) {
			var cached = util._getCache(key); 
			assert.isUndefined(cached);
		}
	},	
	'try to scrape with unknown type' : {
		topic: function() {
			var self = this;
			var key = {
				type: 'test',
				appId: '725989866'
			};
			util.smartbanner(key, function(error, html){
				self.callback(error, html, key);
			});
		},
		'returns error': function(error, html, key) {
			assert.ok(error);
			assert.isNotNull(error);
		},
		'returns no html snippet': function(error, html, key) {
			assert.ok(! /<div id="smartbanner"/.test(html));
		},
		'check cached element': function(error, html, key) {
			var cached = util._getCache(key); 
			assert.isUndefined(cached);
		}
	},	
})
.export(module);


