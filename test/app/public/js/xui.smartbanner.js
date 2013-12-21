/*!
 * xui Smart Banner
 * Copyright (c) 2013 commenthol
 * Based on (c) 2012 Arnold Daniels <arnold@jasny.net>
 * Based on 'jQuery Smart Web App Banner' by Kurt Zenisek @ kzeni.com
 */
!function (x$) {


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

	function smartbanner(options) {
		var defaults = {
			language: "de",
			url: "/smartbanner",
			daysHidden: 15,
			daysReminder: 90,
		};

		var self = extend(defaults, options, { type: null });

		parseUserAgent();
		if (! self.type || cookie.read('sb-closed') || cookie.read('sb-view')) { return; }

		xhr(function(){
			if (this.status === 200) {
				x$('body').bottom(this.responseText);
				component(self);
			}
		});

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
		}

		function xhr(callback) {
			var s = 'type=' + self.type + '&appId=' + self.appId[self.type];
			x$().xhr(self.url, {
				method: 'post',
				data: s,
				async: true,
				callback: callback
			});
		}

		function component(opts) {

			var self = {};
			self.elem = x$('#smartbanner');
			self.origTopHtml = parseFloat(x$('html').getStyle('margin-top')[0]);

			var show = function() {
				self.elem.addClass('show');
				setTimeout(function(){
					self.bannerheight = self.elem[0].offsetHeight + 2;
					x$('html').setStyle('margin-top', self.origTopHtml + self.bannerheight + "px");
					self.elem.setStyle('top', 0);
					if (opts.type === 'windowsphone') {
						self.elem.addClass('windows');
					}
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
