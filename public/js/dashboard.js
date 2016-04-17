var app = angular.module('StarterApp', ['ngRoute', 'LocalStorageModule', 'angularify.semantic', 'socket-io']);

app.controller('AppCtrl', ['$scope', '$location',
    function($scope, $location){
        $scope.menu = [];

        $scope.isActive = function (viewLocation) { 
            return viewLocation === $location.path();
        };

        $scope.menu.push({
            name: 'Lower Thirds',
            url: '/lowerThirds',
            type: 'link',
            icon: 'tasks'
        });

        $scope.menu.push({
            name: 'Scoreboard',
            url: '/scoreboard',
            type: 'link',
            icon: 'soccer',
        });
        
        $scope.menu.push({
            name: 'Stats',
            url: '/stats',
            type: 'link',
            icon: 'soccer',
        });

    }
]);

/*
 *  Configure the app routes
 */
app.config(['$routeProvider', 'localStorageServiceProvider',
    function($routeProvider, localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('la1tv');

        $routeProvider
            .when("/lowerThirds", {
                templateUrl: '/partials/lowerThirds.tmpl.html',
                controller: 'lowerThirdsCGController'
            })
            .when("/scoreboard", {
                templateUrl: '/partials/scoreboard.tmpl.html',
                controller: 'scoreboardCGController'
            })
            .when("/stats", {
                templateUrl: '/partials/stats.tmpl.html',
                controller: 'statsCGController'
            })
            .otherwise({redirectTo: '/scoreboard'});
    }
]);

app.controller('lowerThirdsCGController', ['$scope', 'localStorageService', 'socket',
    function($scope, localStorageService, socket){

        var stored = localStorageService.get('lower_thirds');

        if(stored === null) {
            $scope.queuedThirds = [];
        } else {
            $scope.queuedThirds = stored;
        }

        $scope.add = function(item) {
            $scope.queuedThirds.push(item);

            $scope.lowerThirdsForm.$setPristine();
            $scope.lowerThird = {};
        };

        $scope.remove = function(index){
            $scope.queuedThirds.splice(index, 1);
        };

        $scope.show = function(side, item) {
            socket.emit("lowerthird:" + side, item);
        };

        $scope.hide = function() {
            socket.emit("lowerthird:hide");
        };

        $scope.$on("$destroy", function() {
            localStorageService.set('lower_thirds', $scope.queuedThirds);
        });
    }
]);

app.controller('statsCGController', ['$scope', 'socket',
    function($scope, socket){
        
        $scope.add = function(item) {
            $scope.scorers.push(item);
            
            $scope.scorersForm.$setPristine();
            $scope.scorer = {};
        };

        $scope.remove = function(index){
            $scope.scorers.splice(index, 1);
        };
        
        socket.on("scorers", function (msg) {
            $scope.scorers = msg;
        });
        
        $scope.$watch('scorers', function() {
            if ($scope.scorers) {
                socket.emit("scorers", $scope.scorers);
            } else {
                socket.emit("scorers:get");
            }
        }, true);
        
        socket.on("scoreboard", function (msg) {
            $scope.scoreboard = msg;
        });
        
        $scope.$watch('scoreboard', function() {
            if ($scope.scoreboard) {
                socket.emit("scoreboard", $scope.scoreboard);
            } else {
                socket.emit("scoreboard:get");
            }
        }, true);
        
        $scope.periods = ['1st Half', 'Half-time', '2nd Half', 'Full-time', 'Extra-time'];
    
        $(function () {
          $('.ui.dropdown').dropdown();
        });
    }
]);

app.controller('scoreboardCGController', ['$scope', 'socket',
    function($scope, socket){
        //Clock Functions
        
        socket.on("clock:tick", function (msg) {
            $scope.clock = msg;
            if (msg == '00:00') {
                $scope.scoreboard.clockPause = true;
            }
        });

        $scope.pauseClock = function() {
            socket.emit("clock:pause");
            $scope.scoreboard.clockPause = !$scope.scoreboard.clockPause;
        };

        $scope.resetClock = function() {
            socket.emit("clock:reset");
        };

        $scope.setClock = function(val) {
            if (!val.match(/^\d{2}:(?:[0-5]\d)$/)) {
                alert('Invalid time entered.');
                $scope.time = null;
            } else {
                socket.emit("clock:set", val);
            }
        };

        $scope.downClock = function() {
            socket.emit("clock:down");
        };

        $scope.upClock = function() {
            socket.emit("clock:up");
        };

        //Score Functions
        
        socket.on("scoreboard", function (msg) {
            $scope.scoreboard = msg;
        });
        
        //Get data from server
        
        $scope.$watch('scoreboard', function() {
            if ($scope.scoreboard) {
                socket.emit("scoreboard", $scope.scoreboard);
            } else {
                getScoreData();
            }
        }, true);
        
        function getScoreData() {
            socket.emit("scoreboard:get");
            socket.emit("clock:get");
        };
        
        //Team Select
        $scope.colleges = [{
          shortname: 'yrk',
          name: 'York'
        }, {
          shortname: 'shf',
          name: 'Sheffield'
        }, {
          shortname: 'nth',
          name: 'Northumbria'
        }];
    
        $(function () {
          $('.ui.dropdown').dropdown();
        });

    }
]);