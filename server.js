var express = require('express');
var app = express();
var _ = require('underscore');
var config = require('./config.js');
var cronJob = require('cron').CronJob;
var encode = require('./lib/encode');
var sprintf = require('./lib/sprintf');
var Plugins = require('./lib/plugins');
var fs = require('fs');

// Configure the server
app.configure(function(){
        app.use(express.favicon());
        app.use(express.static(__dirname + '/public'));
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
        app.use(app.router);
    }
);

var download = function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close();
            cb();
        });
    });
};

// Routes
app.get("/vl/bc.jsp", function(req, res) {
    res.sendfile(__dirname + '/public/bootcode.bin');
});

app.get('/vl/locate.jsp', function(req, res){
    res.send(sprintf('ping %s:%d\nbroad %s:%d', config.server.host, config.server.port, config.server.host, config.server.port));
});

app.get('/vl/p4.jsp', function(req, res){
    var data = [0x7f, 0x03, 0x00, 0x00, 0x01, 5];
    var ambient = [];

    if (bunnyQueue.length > 0) {
        var doc = bunnyQueue.shift();
        doc.sn = config.bunnySerial;

        if (doc.action === "tts"){
            var url = "http://translate.google.com/translate_tts?ie=utf-8&tl=en&q=" + encodeURIComponent(doc.txt);
            download(url, './public/tts.mp3', function() {
                Plugins.fire('ping', {'data': data, 'ambient': ambient, 'doc': doc});
                data.push(0xff, 0x0a);
                res.end(encode.array(data), 'binary');
                return;
            });
        }

        Plugins.fire('ping', {'data': data, 'ambient': ambient, 'doc': doc});
    }

    data.push(0xff, 0x0a);
    res.end(encode.array(data), 'binary');
});

app.get('/failed/:jobName/:names', function(req, res){
    bunnyQueue.push({ left: 9, right: 9, action: 'ears' });  // sad ears
    bunnyQueue.push({ action: 'tts', txt: req.params.names + ' caused the ' + req.params.jobName + ' build to fail' });
    res.send('');
});

app.get('/broken/:jobName/:names', function(req, res){
    bunnyQueue.push({ left: 5, right: 5, action: 'ears' });  // sad ears
    bunnyQueue.push({ action: 'tts', txt: req.params.names + ' caused the ' + req.params.jobName + ' build to break' });
    res.send('');
});

app.get('/failed/:jobName', function(req, res){
    bunnyQueue.push({ left: 9, right: 9, action: 'ears' });  // sad ears
    bunnyQueue.push({ action: 'tts', txt: req.params.jobName + ' build failed' });
    res.send('');
});

app.get('/broken/:jobName', function(req, res){
    bunnyQueue.push({ left: 5, right: 5, action: 'ears' });  // ok ears
    bunnyQueue.push({ action: 'tts', txt: req.params.jobName + ' has broken tests' });
    res.send('');
});

app.get('/pass', function(req, res){
    bunnyQueue.push({ left: 1, right: 1, action: 'ears' }); // happy ears
    res.send('');
});

app.get('/mood/:mood', function(req, res) {
    if (req.params.mood === 'happy') {
        bunnyQueue.push({ left: 1, right: 1, action: 'ears' });  // sad ears
    }
    else if (req.params.mood === 'ok') {
        bunnyQueue.push({ left: 5, right: 5, action: 'ears' });  // ok ears
    }
    else {
        bunnyQueue.push({ left: 9, right: 9, action: 'ears' });  // sad ears
    }

    res.send('');
});

app.get('/tts/:msg', function(req, res){
    bunnyQueue.push({ action: 'tts', txt: req.params.msg });
    res.send('ok');
});

// Hold down the button and speak
/* Disable for heroku - not used.
 app.post('/vl/record.jsp', function(req, res){
 var stream = fs.createWriteStream('recordings/' + new Date().getTime() + '.mp3');
 req.pipe(stream);
 req.on('finish', function(){
 stream.close();
 res.send('');
 });
 });
 */

// CONFIG
process.env.TZ = config.server.tz || 'GMT';
Plugins = exports.Plugins = new Plugins(this);
Plugins.load(config.plugins);
var bunnyQueue = config.startupCommands;

var cronJobs = _.map(config.scheduledCommands, function(c) {
    return new cronJob({
        cronTime: c.time,
        onTick: function() {
            var d = new Date();
            console.log("Scheduled Action: " + c.cmd.action + "   (" + d.toUTCString() + ")");
            bunnyQueue.push(c.cmd);
        },
        start: true
    });
});

//////////////////
// START SERVER //
//////////////////
var port = process.env.PORT || 6000;
console.log("Starting Bunny...");
app.listen(port, function() {
    console.log("Listening on " + port);
});