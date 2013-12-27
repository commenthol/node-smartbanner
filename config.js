"use strict";

var config = {
	timeout: 5 * 60,              // caching timeout in seconds
	timeoutOnError: 5 * 60,       // retry timeout in seconds in case of error
	language: "de",               // language to resolve apple app store
	acceptLanguage: "de-DE",      // accept language of backend request
	viewButtonText: "Anzeigen",   // button text to view and install app 
	closeButtonText: "Schließen", // button text to close smartbanner (windowsphone only)
	freeText: {                   // Replacement text for "Free" App offer
		regex: /Free|Gratis|Kostenlos/i,
		view: "GRATIS"
	},
	type: {                       // app store specifics
		//                          // app: URI to install app
		//                          // store: URL to scrape page
		//                          // text: text to show in smartbanner next to price
		ios: {
			app:   'https://itunes.apple.com/#language#/app/id#appId#',
			store: 'https://itunes.apple.com/#language#/app/id#appId#',
			text:  'Im App Store',
		},
		android: {
			app:   'market://details?id=#appId#',
			store: 'https://play.google.com/store/apps/details?id=#appId#',
			text:  'Im Google Play Store',
		},
		windowsphone: {
			app:   'zune://navigate/?phoneappID=#appId#',
			store: 'http://windowsphone.com/s?appId=#appId#',
			text:  'Im Windows Store',
		}
	}
};

config.backend = {              // config parameters for the backend call
	headers: {
		'User-Agent': '-',
		'Accept-Language': config.acceptLanguage,
		'Accept': 'text/html',
	},
	//proxy: 'http://myproxy:8080',
};

module.exports = config;
