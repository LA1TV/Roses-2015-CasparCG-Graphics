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

app.controller('scoreboardCGController', ['$scope', 'socket',
    function($scope, socket){
        //Clock Functions
        
        socket.on("clock:tick", function (msg) {
            $scope.clock = msg;
        });

        $scope.pauseClock = function() {
            socket.emit("clock:pause");
        };

        $scope.resetClock = function() {
            socket.emit("clock:reset");
        };

        $scope.setClock = function(val) {
            socket.emit("clock:set", val);
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
          shortname: 'alc',
          name: 'Alcuin'
        }, {
          shortname: 'con',
          name: 'Constantine'
        }, {
          shortname: 'der',
          name: 'Derwent'
        }, {
          shortname: 'gdr',
          name: 'Goodricke'
        }, {
          shortname: 'jam',
          name: 'James'
        }, {
          shortname: 'hal',
          name: 'Halifax'
        }, {
          shortname: 'lan',
          name: 'Langwith'
        }, {
          shortname: 'van',
          name: 'Vanbrugh'
        }, {
          shortname: 'wen',
          name: 'Wentworth'
        }];
    
        $(function () {
          $('.ui.dropdown').dropdown();
        });

    }
]);