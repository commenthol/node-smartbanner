/**
 * test extraction methods for the different stores
 * access the page in itunes of your app and store as "ios.html"
 * access the page in google play of your app and store as "android.html"
 * access the page in windows store of your app and store as "windowsphone.html"
 * 
 * run script with `node extract.test.js [ios|android|windowsphone]`
 */

"use strict";

var fs = require('fs');
var extract = require('../../lib/extract.js');

var argv = process.argv.slice(1);
var type = argv[1] || 'ios';

var body = fs.readFileSync(__dirname + '/'+ type +'.html');

var obj = extract(type, body);

console.log(obj);
