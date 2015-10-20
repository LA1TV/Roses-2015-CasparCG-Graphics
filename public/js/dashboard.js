var app = angular.module('StarterApp', ['ngRoute', 'LocalStorageModule', 'angularify.semantic', 'socket-io']);

app.controller('AppCtrl', ['$scope', '$location',
    function($scope, $location){
        $scope.menu = [];

        $scope.isActive = function (viewLocation) { 
            return viewLocation === $location.path();
        };

        $scope.menu.push({
            name: 'General',
            url: '/general',
            type: 'link',
            icon: 'settings',
        });

        $scope.menu.push({
            name: 'Lower Thirds',
            url: '/lowerThirds',
            type: 'link',
            icon: 'tasks'
        });

        $scope.menu.push({
            name: 'Football/Rugby',
            url: '/football',
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
            .when("/general", {
                templateUrl: '/partials/general.tmpl.html',
                controller: 'generalCGController'
            })
            .when("/lowerThirds", {
                templateUrl: '/partials/lowerThirds.tmpl.html',
                controller: 'lowerThirdsCGController'
            })
            .when("/football", {
                templateUrl: '/partials/football.tmpl.html',
                controller: 'footballCGController'
            })
            .otherwise({redirectTo: '/general'});
    }
]);

app.controller('generalCGController', ['$scope', 'localStorageService', 'socket',
    function($scope, localStorageService, socket){

        $scope.general = localStorageService.get('general');

        $scope.$watch('general', function() {
            socket.emit("bug", $scope.general);
        }, true);

        $scope.$on("$destroy", function() {
            localStorageService.set('general', $scope.general);
        });
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

app.controller('footballCGController', ['$scope', 'localStorageService', 'socket',
    function($scope, localStorageService, socket){
        var stored = localStorageService.get('football');

        if (stored === null) {
            $scope.football = { 
                team1: 'TM1', team2: 'TM2', score1: 0, score2: 0, showScore: false, showTime: false,
            };
        } else {
            $scope.football = stored;
        }
        
        //Clock Functions
        $scope.clock    = "00:00";

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

        $scope.$watch('football', function() {
            socket.emit("football", $scope.football);
        }, true);

        $scope.$on("$destroy", function() {
            localStorageService.set('football', $scope.football);
        });
        
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