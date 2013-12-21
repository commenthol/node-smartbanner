"use strict";

var config = {
	timeout: 5 * 60,            // caching timeout in seconds
	language: "de",             // language to resolve apple app store
	acceptLanguage: "de-DE",    // accept language of backend request
	viewButtonText: "Anzeigen", // button text to view and install app 
	viewFreeText: "GRATIS",
	ios: {
		app: 'https://itunes.apple.com/#language#/app/id#appId#',
		store: 'https://itunes.apple.com/#language#/app/id#appId#',
		text: 'Im App Store',
	},
	android: {
		app: 'market://details?id=#appId#',
		store: 'https://play.google.com/store/apps/details?id=#appId#',
		text: 'Im Google Play Store',
	},
	windowsphone: {
		app: 'zune://navigate/?phoneappID=#appId#',
		store: 'http://windowsphone.com/s?appId=#appId#',
		text: 'Im Windows Store',
	}
};

module.exports = config;

