var express = require('express');
var app = express();
var jsforce = require('./src/lib/JSForceConnection');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

app.use(cookieParser());


// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

// set the home page route
app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/public/Html/Index.htm'));
});

app.get('/oauth2/auth', function (req, res) {
	console.log('parms' + req.query.env);
	jsforce.redirectToAuthentication(res, req.query.env);
});

app.get('/oauth2/auth/callBack_success', function (req, res) {
	console.log('token' + req.query.code);
	console.log(res)
	jsforce.authenticateConnection(req.query.code).
		then((userInfo) => {
			console.log('Authentication Successful' + JSON.stringify(userInfo));
			res.cookie('token', req.query.code).sendFile(path.join(__dirname + '/public/Html/package.html'));
		}).
		catch((err) => {
			console.log('error' + err);
		});
});

app.listen(port, function () {
	console.log('Our app is running on:' + port);
});


