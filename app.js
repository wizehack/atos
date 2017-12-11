var express = require('express');
var mkdirp = require('mkdirp');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    console.log("Connected to mongod server");
});

// connect to myapp db
mongoose.connect('mongodb://localhost/myapp', { useMongoClient: true });

// define model
var TestCase = require('./model/testcase')
var TestSuite = require('./model/testsuite')

app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// configure port
var port = process.env.PORT || 52270;

// configure router
var tcRouter = require('./routes/tcRouter')(app, TestCase);
var resultRouter = require('./routes/resultRouter')(app, TestSuite);
var uploadRouter = require('./routes/uploadRouter')(app, fs, mkdirp, __dirname);

app.listen(52270, function () {
    var ip = '127.0.0.1';
    console.log('Server Running at http://' + ip + ':' + port);
});
