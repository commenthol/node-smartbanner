/*!
 * xui Smart Banner
 * Copyright (c) 2013 commenthol
 * Based on (c) 2012 Arnold Daniels <arnold@jasny.net>
 * Based on 'jQuery Smart Web App Banner' by Kurt Zenisek @ kzeni.com
 */
!function (x$) {

	// extend objects
	function extend(t) {
		for (var i = 1, l = arguments.length, s; i < l; i += 1) {
			s = arguments[i];
			for (var p in s) {
				if (s.hasOwnProperty(p)) {
					t[p] = s[p];
				}
			}
		}
		return t;
	}

	/*
	 * cookie handling
	 */
	var cookie = {
		read: function (key) {
			var value;
			return (value = (new RegExp("(?:^|; )" + encodeURIComponent(key) + "=([^;]*)")).exec(document.cookie)) ? value[1] : null
		},
		write: function (key, value, daysToExpire) {
			var ex = new Date();
			ex.setDate(ex.getDate() + daysToExpire);
			value = escape(value) + ((daysToExpire == null) ? "" : "; expires=" + ex.toUTCString());
			document.cookie = key + "=" + value;
		},
		erase: function(key) {
			var ex = new Date(0);
			document.cookie = key + "=; expires=" + ex.toUTCString();
		}
	}

	/*
	 * smartbanner component
	 */
	function smartbanner(options) {

		var defaults = {
			url: "/smartbanner",
			daysHidden: 15,
			daysReminder: 90,
		};

		var self = extend(defaults, options, { type: null });

		// initialize component
		(function init() {
			if (! parseUserAgent() || cookie.read('sb-closed') || cookie.read('sb-view')) { return; }

			xhr(function(){
				// add snippet to DOM
				if (this.status === 200) {
					x$('body').bottom(this.responseText);
					behaviour(self);
				}
			});
		})();

		// detect the OS
		function parseUserAgent() {
			var ua = navigator.userAgent;
			if (/^ios|android|windowsphone$/.test(self.force)) {
				self.type = self.force;
			}
			else if (ua.match(/iPad|iPhone|iPod/i) != null) {
				self.type = 'ios'
			}
			else if (ua.match(/Android/i) != null) {
				self.type = 'android'
			}
			else if (ua.match(/Windows Phone/i) != null) {
				self.type = 'windowsphone'
			}
			if (self.type && self.appId[self.type]) {
				return true;
			}
			return false;
		}

		// get the html snippet to render the smartbanner
		function xhr(callback) {
			var url = self.url + '/' + self.type + '/' + self.appId[self.type];
			x$().xhr(url, {
				method: 'get',
				async: true,
				callback: callback
			});
		}

		// adding controls
		function behaviour(opts) {

			var self = {};
			self.elem = x$('#smartbanner');
			self.origTopHtml = parseFloat(x$('html').getStyle('margin-top')[0]);

			var show = function() {
				self.elem.addClass('show');
				setTimeout(function(){
					self.bannerheight = self.elem[0].offsetHeight;
					x$('html').setStyle('margin-top', self.origTopHtml + self.bannerheight + "px");
					self.elem.setStyle('top', 0);
				}, 50);
			}

			var hide = function() {
				x$('html').setStyle('margin-top', self.origTopHtml + "px");
				self.elem.removeClass('show');
			}

			var close = function() {
				hide();
				cookie.write('sb-closed','true', opts.daysHidden);
			}

			var view = function() {
				hide();
				cookie.write('sb-view','true', opts.daysReminder);
			}

			var listen = function() {
				self.elem.find('.sb-close').on('click',close);
				self.elem.find('.sb-button').on('click',view);
			}

			if (self.elem && self.elem[0]) {
				show();
				listen();
			}
			else {
				self = {};
			}
		}

	};

	x$.extend({ smartbanner: smartbanner });

}(window.xui);
