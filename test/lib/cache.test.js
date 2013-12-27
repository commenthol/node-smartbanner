/*
 * cache tests
 */
 
"use strict";

var vows   = require('vows');
var assert = require('assert');
var cache  = require('../../lib/cache.js');

vows.describe('cache tests')
.addBatch({
	'set and get cache' : {
		topic: function() {
			var key = {
					type: 'ios',
					appId: 'test'
				};
			var obj = {
					content: 'test'
				};

			cache.set(key, obj);
			
			this.callback(null, key, obj);
		},
		'same obj returned': function(error, key, obj) {
			var result = cache.get(key);
			
			assert.deepEqual(result, obj);
		},
		'not expired': function(error, key, obj) {
			var result = cache.expired(key);
			
			assert.ok(!result);
		},
	},
	'set and get cache with timeout expired step1' : {
		topic: function() {
			var key = {
					type: 'ios',
					appId: 'test1'
				};
			var obj = {
					content: 'test1'
				};

			cache.set(key, obj, 1);
			
			this.callback(null, key, obj);
		},
		'same obj returned': function(error, key, obj) {
			var result = cache.get(key);
			
			assert.deepEqual(result, obj);
		},
		'not expired': function(error, key, obj) {
			var result = cache.expired(key);
			
			assert.ok(!result);
		},
	},
	'set and get cache with timeout expired step2' : {
		topic: function() {
			var key = {
					type: 'ios',
					appId: 'test1'
				};
			var obj = {
					content: 'test1'
				};
			var self = this;

			setTimeout(function(){
				self.callback(null, key, obj);
			}, 2000);
		},
		'same object returned but trigger set': function(error, key, obj) {
			var result = cache.get(key);
				
			assert.deepEqual(result, obj);
		},
		'expired': function(error, key, obj) {
			var result = cache.expired(key);
			
			assert.ok(result);
		},
	},
})
.addBatch({
	'set and get cache with wrong keys' : {
		topic: function() {
			var key = {
					type: 'ios',
					appId1: 'test'
				};
			var obj = {
					content: 'test'
				};

			cache.set(key, obj);
			
			this.callback(null, key, obj);
		},
		'same obj returned': function(error, key, obj) {
			var result = cache.get(key);
			
			assert.deepEqual(result, undefined);
		},
		'not expired': function(error, key, obj) {
			var result = cache.expired(key);

			assert.ok(!result);
		},
	},
})
.export(module);
