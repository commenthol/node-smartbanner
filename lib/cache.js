/*
 * caching of result objects per type and appId
 */

"use strict";

/**
 * cache to store values
 */
var cache = {};
var timeouts = {};

/**
 * Module variables
 */
var _M = {};
var  M = {};

module.exports = M;

/**
 * internal methods
 */
 
_M.hasKey = function(key) {
	return key && key.type && key.appId;
};

/**
 * handling timeouts 
 */
_M.timeout = function(key) {

	var self = {};

	function prep() {
		if (_M.hasKey(key)) {
			if (!timeouts[key.type]) {
				timeouts[key.type] = {};
			}
			return true;
		}
	}

	function date() {
		return Date.now() / 1000;
	}

	self.expired = function() {
		if (date() > self.get() ) {
			return true;
		}
		
		return false;
	};

	self.get = function() {
		if (prep()) {
			return timeouts[key.type][key.appId] || 0;
		}
	};
	
	self.set = function(timeout) {
		if (prep()) {
			timeout = timeout || 5 * 60; // default is 5 minutes
			timeouts[key.type][key.appId] = date() + timeout;
		}
	};
	
	return self;
};

/**
 * handling cached objects
 */
_M.cachedObj = function(key) {
	
	var self = {};
	self.hasObj = cache[key.type] && cache[key.type][key.appId];
		
	self.get = function() {
		if (_M.hasKey(key) && self.hasObj) {
			return cache[key.type][key.appId];
		}
		return;
	};

	self.set = function(obj) {
		if (_M.hasKey(key)) {
			if (! cache[key.type]) {
				cache[key.type] = {};
			}
			cache[key.type][key.appId] = obj;
			return true;
		}
		return false;
	};
	
	return self;
};

/**
 * Obtain data from the cache if present.
 * 
 * @param    {Object} key
 * @property {String} key.type
 * @property {String} key.appId
 * @return   {Object} obj from cache
 */
M.get = function(key) {
	return _M.cachedObj(key).get();
};

/**
 * Check if cache is expired.
 * 
 * @param    {Object} key
 * @property {String} key.type
 * @property {String} key.appId
 * @return   {Boolean} true if expired, otherwise false
 */
M.expired = function(key) {
	return _M.timeout(key).expired();
};

/**
 * set the cache with `obj`
 * 
 * @param    {Object} key
 * @property {String} key.type
 * @property {String} key.appId
 * @param    {Object} obj : obj to be cached
 * @param    {Number} timeout : timeout in seconds from now
 */
M.set = function(key, obj, timeout) {
	M.setTimeout(key, timeout);

	return _M.cachedObj(key).set(obj);
};

/**
 * set the cache timeout
 * 
 * @param    {Object} key
 * @property {String} key.type
 * @property {String} key.appId
 * @param    {Number} timeout : timeout in seconds from now
 */
M.setTimeout = function(key, timeout) {
	_M.timeout(key).set(timeout);
};
