
/**
 * Module dependencies.
 */
var fs = require('fs');
var accessLogFile = fs.createWriteStream('access.log', {flags: 'a'});
var errorLogFile = fs.createWriteStream('error.log', {flags: 'a'});

var express = require('express');
var routes = require('./routes');
//var user = require('./routes/user');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var flash = require('connect-flash');
var partials = require('express-partials');
var settings = require('./settings');

var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
app.set('view engine', 'jade');
app.use(express.logger({stream: accessLogFile}));
app.use(partials());
app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(flash());
app.use(express.cookieParser());
app.use(express.session({
	secret: settings.cookieSecret,
	store: new MongoStore({
		db: settings.db
	})
}));


// 2.x
// app.dynamicHelpers({
// 	user: function(req, res){
// 		return req.session.user;
// 	},
// 	error: function(req, res){
// 		var err = req.flash('error');
// 		return err.length ? err : null;
// 	},
// 	success: function(req, res){
// 		var succ = req.flash('success');
// 		return succ.length ? succ : null
// 	}
// })

//3.x
app.use(function(req, res, next){
	res.locals.error = req.flash('error').toString();
	res.locals.success = req.flash('success').toString();
	res.locals.user = req.session ? req.session.user : null;
	next();
})

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// app.set('env', 'production');

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

if('production' == app.get('env')){
	app.use(function(err, req, res, next){
		var meta = '[' + new Date() + '] ' + req.url + '\n';
		errorLogFile.write(meta + err.stack + '\n');
		//next(err);
	})
}

app.get('/', routes.index);
app.get('/u/:user', routes.user);

app.post('/post', routes.checkLogin);
app.post('/post', routes.post);

app.get('/reg', routes.checkNotLogin);
app.get('/reg', routes.reg);
app.post('/reg', routes.doReg);

app.get('/login', routes.checkNotLogin);
app.get('/login', routes.login);
app.post('/login', routes.doLogin);

app.get('/logout', routes.checkLogin);
app.get('/logout', routes.logout);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
