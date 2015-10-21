var app = angular.module('cgApp', ['ngAnimate', 'socket-io']);

app.controller('lowerThirdsCtrl', ['$scope', 'socket',
    function($scope, socket){
        $scope.showLeft = false;

        socket.on("lowerthird:hide", function (msg) {
            $scope.showLeft = false;
            $scope.showRight = false;
        });

        socket.on("lowerthird:left", function (msg) {
            if($scope.showLeft) {
                $scope.showLeft = false;
            }
            $scope.left = msg;
            $scope.showLeft = true;
        });

        socket.on("lowerthird:right", function (msg) {
            if($scope.showRight) {
                $scope.showRight = false;
            }
            $scope.right = msg;
            $scope.showRight = true;
        });
    }
]);

app.controller('scoreboardCtrl', ['$scope', 'socket',
    function($scope, socket){

        socket.on("scoreboard", function (msg) {
            $scope.scoreboard = msg;
        });

        socket.on("clock:tick", function (msg) {
            $scope.clock = msg;
        });
        
        // Get data from server
        $scope.$watch('scoreboard', function() {
            if (!$scope.scoreboard) {
                getScoreData();
            }
        }, true);
        
        function getScoreData() {
            socket.emit("scoreboard:get");
            socket.emit("clock:get");
        };
    }
]);