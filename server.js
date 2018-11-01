var express 	= require('express'),
	gulp		= require('gulp'),
	http 		= require('http'),
	less		= require('gulp-less'),
	path 		= require('path'),
	watch		= require('gulp-watch'),
	Stopwatch 	= require('./models/stopwatch');

gulp.task('less', function(){
	return gulp.src('./public/less/**/*.less')
		.pipe(less({
			paths: [path.join(__dirname, 'less', 'includes')]
		}))
		.pipe(gulp.dest('./public/css'));
});

gulp.task('watchFiles', function(){
	return watch('./public/less/**/*.less', function(){
		gulp.start('less');
	});
});

gulp.task('default', ['less', 'watchFiles']);

gulp.start('default');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var eventLogo = "/images/roses2018logo.png";

var homeTeamName = "Lancaster";
var awayTeamName = "York";
var homeTeamShortName = "LAN";
var awayTeamShortName = "YOR";
var homeTeamImage = "images/LancasterSport250.png";
var awayTeamImage = "images/YorkSport250.png"

var bug = {livetext: "Live", locationtext: '', showLive: false, showLocation: false, logo: eventLogo};
var boxing = {homeTeam: homeTeamShortName, awayTeam: awayTeamShortName, homeScore: 0, awayScore: 0, currRound: ''};
var score = {totalPoints: 354};
var football = {homeTeam: homeTeamName, awayTeam: awayTeamName, homeTeamShort: homeTeamShortName, awayTeamShort: awayTeamShortName, homeScore: 0, awayScore: 0, homeTeamImage: homeTeamImage, awayTeamImage, awayTeamImage};
var rugby = {homeTeam: homeTeamName, awayTeam: awayTeamName, homeTeamShort: homeTeamShortName, awayTeamShort: awayTeamShortName, homeScore: 0, awayScore: 0};
var basketball = {homeTeam: homeTeamName, awayTeam: awayTeamName, homeTeamShort: homeTeamShortName, awayTeamShort: awayTeamShortName, homeScore: 0, awayScore: 0};
var darts = {match: "Darts", homeTeam: homeTeamName, awayTeam: awayTeamName, player1: homeTeamName, player2: awayTeamName, set1: 0, set2:0, leg1: 0, leg2: 0, score1:501, score2:501 };
var swimming = {order: '', lanes: [], homeTeam: homeTeamName, awayTeam: awayTeamName, laneOrder: [], prevOrderLength: 0};
for (var i = 0; i < 8; i++){
	swimming.lanes[i] = {
		id: i,
		name: "",
		team: ""
	};
}

var grid = {headingcolor:"#BC204B", leftcolor: "#1f1a34", rightcolor:"#1f1a34"};
var archery = {};
var tennisOptions = {homeTeam: homeTeamName, awayTeam: awayTeamName, matchName: "", maxSets: 3, disableInput: false, showScore: false, showSets: false, showStats: false}
var tennisScore   = [{sets1: [0], sets2: [0],
                      set1: 0, set2: 0,
                      game1: 0, game2: 0,
                      point1: 0, point2: 0,
                      pointName1: 0, pointName2: 0,
                      pointsServed1: 0, pointsServed2: 0,
                      pointsWon1: 0, pointsWon2:0,
                      firstServeWon1: 0, firstServeWon2: 0,
                      secondServeWon1: 0, secondServeWon2: 0,
                      ace1: 0, ace2: 0,
                      singleFault1: 0, singleFault2: 0,
                      doubleFault1: 0, doubleFault2: 0,
					  breakPoint1: 0, breakPoint2: 0,
					  breaksWon1: 0, breaksWon2: 0,
					  serviceGame1: 0, serviceGame2: 0,
					  servicesWon1: 0, servicesWon2: 0,
                      pointsPlayed: 0, server: 1, tiebreak: false, gamePoint: "", firstFault: false}];
var badminton = {match: "Badminton", subtitle: "Best of 3 Games Wins Match", homeTeam: homeTeamName, awayTeam: awayTeamName, game1: 0, game2:0, point1: 0, point2: 0 };
var netball = {homeTeam: homeTeamName, awayTeam: awayTeamName, homeScore: 0, awayScore: 0};
var waterpolo = {homeTeam: homeTeamName, awayTeam: awayTeamName, homeScore: 0, awayScore: 0};

//Clock Functions
var stopwatch = new Stopwatch();

stopwatch.on('tick:stopwatch', function(time) {
	io.sockets.emit("clock:tick", time);
});



io.on('connection', function(socket) {
	console.log("Client Socket Connected");

	socket.on("teamName:home", function(){
		io.sockets.emit("teamName:home", homeTeamName);
	});

	socket.on("teamName:home:short", function(){
		io.sockets.emit("teamName:home:short", homeTeamShortName);
	});

	socket.on("teamName:away", function(){
		io.sockets.emit("teamName:away", awayTeamName);
	});

	socket.on("teamName:away:short", function(){
		io.sockets.emit("teamName:away:short", awayTeamShortName);
	});

	socket.on("config:logo:get", function(){
		io.sockets.emit("config:logo", eventLogo);
	});

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

		socket.on("grid", function(payload) {
        grid = payload;
        io.sockets.emit("grid", payload);
        console.log("Updating: grid");
    });

	/*
	 * 		General Functions
	 */
	socket.on("bug", function(msg) {
        bug = msg;
		io.sockets.emit("bug", msg);
	});

    socket.on("bug:get", function(msg) {
		io.sockets.emit("bug", bug);
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

	socket.on("lowerthird:full", function(msg) {
		io.sockets.emit("lowerthird:full", msg);
	});

	socket.on("lowerthird:hidefull", function() {
		io.sockets.emit("lowerthird:hidefull");
	});

	socket.on("lowerthird:hideleft", function() {
		io.sockets.emit("lowerthird:hideleft");
	});

	socket.on("lowerthird:hideright", function() {
		io.sockets.emit("lowerthird:hideright");
	});

	socket.on("lowerthird:hideall", function() {
		io.sockets.emit("lowerthird:hideall");
	});

	/*
	 * 		Boxing
	 */
	socket.on("boxing", function(msg) {
        boxing = msg;
		io.sockets.emit("boxing", msg);
	});

    socket.on("boxing:get", function(msg) {
		io.sockets.emit("boxing", boxing);
	});

	/*
	 * 		Roses Score
	 */
	socket.on("score", function(msg) {
        score = msg;
		io.sockets.emit("score", msg);
	});
	socket.on("lancScore", function(msg){
		io.sockets.emit("lancScore", msg);
	});
	socket.on("yorkScore", function(msg){
		io.sockets.emit("yorkScore", msg);
	});
	socket.on("totalPoints", function(msg){
		io.sockets.emit("totalPoints", msg);
	});
    socket.on("score:get", function(msg) {
		io.sockets.emit("score", score);
	});

	 /*
	 * 		Football
	 */
	socket.on("football", function(msg) {
        football = msg;
		io.sockets.emit("football", msg);
	});

    socket.on("football:get", function(msg) {
		io.sockets.emit("football", football);
	});

	/*
	* 		Rugby
	*/
 	socket.on("rugby", function(msg) {
			 rugby = msg;
	 io.sockets.emit("rugby", msg);
 	});

	 socket.on("rugby:get", function(msg) {
	 io.sockets.emit("rugby", rugby);
	 });

	/*
	 * 		Darts
	 */
	socket.on("darts", function(msg) {
        darts = msg;
		io.sockets.emit("darts", msg);
	});

    socket.on("darts:get", function(msg) {
        io.sockets.emit("darts", darts);
    });

    /*
	 * 		Swimming
	 */
	socket.on("swimming", function(msg) {
        swimming = msg;

		io.sockets.emit("swimming", msg);
	});

    socket.on("swimming:get", function(msg) {
        io.sockets.emit("swimming", swimming);
    });

		/*
 	 * 		Basketball
 	 */
 	socket.on("basketball", function(msg) {
      basketball = msg;
 		io.sockets.emit("basketball", msg);
 	});

  socket.on("basketball:get", function(msg) {
 		io.sockets.emit("basketball", basketball);
 	});

	socket.on("archery", function(msg) {
        archery = msg;
		io.sockets.emit("archery", msg);
	});

		socket.on("archery:get", function(msg) {
				io.sockets.emit("archery", archery);
		});

		/*
		* Badminton
		*/
		socket.on("badminton", function(msg) {
	        badminton = msg;
			io.sockets.emit("badminton", msg);
		});

    socket.on("badminton:get", function(msg) {
        io.sockets.emit("badminton", badminton);
    });

    /*
    * Tennis
    */
    socket.on("tennisOptions", function(msg) {
        tennisOptions = msg;
        io.sockets.emit("tennisOptions", msg);
    });

    socket.on("tennisScore", function(msg) {
		if (!_.isEqual(msg,tennisScore.slice(-1)[0])) {
            tennisScore.push(msg);
		    io.sockets.emit("tennisScore", msg);
		}
    });

    socket.on("tennis:get", function(msg) {
        io.sockets.emit("tennisOptions", tennisOptions);
        io.sockets.emit("tennisScore", tennisScore.slice(-1)[0])
    });

    socket.on("tennis:undo", function() {
        if (tennisScore.length != 1) {
            tennisScore.splice(-1,1);
            io.sockets.emit("tennisScore", tennisScore.slice(-1)[0]);
        }
    });

    socket.on("tennis:reset", function(msg) {
        tennisOptions = {homeTeam: homeTeamName, awayTeam: awayTeamName, matchName: "", maxSets: 3, disableInput: false, showScore: false, showSets: false, showStats: false}
        tennisScore   = [{sets1: [0], sets2: [0],
                          set1: 0, set2: 0,
                          game1: 0, game2: 0,
                          point1: 0, point2: 0,
                          pointName1: 0, pointName2: 0,
                          pointsServed1: 0, pointsServed2: 0,
                          pointsWon1: 0, pointsWon2:0,
                          firstServeWon1: 0, firstServeWon2: 0,
                          secondServeWon1: 0, secondServeWon2: 0,
                          ace1: 0, ace2: 0,
                          singleFault1: 0, singleFault2: 0,
                          doubleFault1: 0, doubleFault2: 0,
						  breakPoint1: 0, breakPoint2: 0,
					      breaksWon1: 0, breaksWon2: 0,
						  serviceGame1: 0, serviceGame2: 0,
					      servicesWon1: 0, servicesWon2: 0,
                          pointsPlayed: 0, server: 1, tiebreak: false, gamePoint: "", firstFault: false}];

        io.sockets.emit("tennisOptions", tennisOptions);
        io.sockets.emit("tennisScore", tennisScore[0]);
    });

    /*
	 * 		Nettball
	 */
	socket.on("netball", function(msg) {
        netball = msg;
		io.sockets.emit("netball", msg);
	});

    socket.on("netball:get", function(msg) {
		io.sockets.emit("netball", netball);
	});

	/*
 * 		Waterpolo
 */
socket.on("waterpolo", function(msg) {
			waterpolo = msg;
	io.sockets.emit("waterpolo", msg);
});

	socket.on("waterpolo:get", function(msg) {
	io.sockets.emit("waterpolo", waterpolo);
});

});

//Serve the puplic dir
app.use(express.static(__dirname + "/public"));

server.listen(3000);
console.log("Now listening on port 3000. Go to http://127.0.0.1:3000/admin to control")
console.log("run 'play 1-1 [html] http://127.0.0.1:3000' in CasparCG to start the graphics")
