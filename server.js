var express 	= require('express'), 
	http 		= require('http'),
	Stopwatch 	= require('./models/stopwatch');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);


//Clock Functions
var stopwatch = new Stopwatch();

stopwatch.on('tick:stopwatch', function(time) {
	io.sockets.emit("clock:tick", time);
});



io.on('connection', function(socket) {
	console.log("Client Socket Connected");

	/*
	 * 		Clock functions
	 */
	socket.on("clock:pause", function() {
		stopwatch.pause();
	});

	socket.on("clock:reset", function() {
		stopwatch.reset();
	});

	socket.on("clock:up", function() {
		stopwatch.countUp();
	});

	socket.on("clock:down", function() {
		stopwatch.countDown();
	});	

	socket.on("clock:set", function(msg) {
		stopwatch.setValue(msg);
	});


	/*
	 * 		General Functions
	 */
	socket.on("bug", function(msg) {
		io.sockets.emit("bug", msg);
	});

	/*
	 * 		Lower Thirds
	 */ 
	socket.on("lowerthird:left", function(msg) {
		io.sockets.emit("lowerthird:left", msg);
	});

	socket.on("lowerthird:right", function(msg) {
		io.sockets.emit("lowerthird:right", msg);
	});

	socket.on("lowerthird:hide", function() {
		io.sockets.emit("lowerthird:hide");
	});

	 /*
	 * 		Score
	 */
	 socket.on("football", function(msg) {
		io.sockets.emit("football", msg);
	});


	/*
	 * 		Darts
	 */
	 socket.on("dart", function(msg) {
		io.sockets.emit("dart", msg);
	});
});

//Serve the puplic dir
app.use(express.static(__dirname + "/public"));

server.listen(3000);
