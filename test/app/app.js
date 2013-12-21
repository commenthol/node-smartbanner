
/**
 * Module dependencies.
 */

var express = require('express');
var stylus  = require('stylus');
var nib     = require('nib');
var http    = require('http');
var path    = require('path');

var smartbanner = require('../../index.js');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

/**
 * a very very simple logger
 * 
 * the log function is appended to req.log
 * in any middleware you can use the logger now
 * 
 * Usage: (within any middleware)
 * 
 * 	var log = req.log || {};
 *  log.debug && log.debug('my debug message'); 
 */
app.use(function(req, res, next) {
	
	var level = 'debug'; // info
	
	function log(msg) {
		console.log(msg);
	}
	
	req.log = { 
		debug:           /debug/.test(level) ? log : null,
		info:       /info|debug/.test(level) ? log : null,
		warn:  /warn|info|debug/.test(level) ? log : null,
		error: log
	};
	
	//~ log(JSON.stringify(req.headers));
	
	next && next();
	return;
});

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(stylus.middleware({
	src: __dirname + "/public",
	compile: function(str, path) {
		return stylus(str)
			.set('filename', path)
			.set('compress', true)
			.define('x-data-uri', stylus.url({ paths: [ ] }))
			.use(nib());
		}
	}	
));
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req,res, next){
  req.url = "/test.html";
  next && next();
});

/**
 * include smartbanner 
 */
app.post('/smartbanner', smartbanner );

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
