var express 	= require('express'), 
	http 		= require('http'),
	Stopwatch 	= require('./models/stopwatch');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

//Scoreboard array
var scoreboard = {
    team1: 'Team 1', team2: 'Team 2', 
    team1short: 'tm1', team2short: 'tm2', 
    score1: 0, score2: 0, 
    fouls1: 0, fouls2: 0, 
    showScore: false, 
    showFouls: false, 
    clockPause: true,
    };

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
    
    socket.on("clock:get", function() {
        io.sockets.emit("clock:tick", stopwatch.getTime());
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
	socket.on("scoreboard", function(msg) {
        scoreboard = msg;
		io.sockets.emit("scoreboard", msg);
	});
    
    socket.on("scoreboard:get", function(msg) {
		io.sockets.emit("scoreboard", scoreboard);
	});
});

//Serve the puplic dir
app.use(express.static(__dirname + "/public"));

server.listen(3000);
