(function(){
'use strict';

var soam = angular.module('soam', [ 
    'ui.bootstrap',
    'SafeApply',
    'ngSanitize',
    'luegg.directives',
    'perfect_scrollbar'
  ]);


soam.controller('terminalsCtrl', ['$scope',
    '$rootScope',
    '$sce',
    'socketService',
    terminalsCtrl]);


function terminalsCtrl($scope, $rootScope, $sce, socketService){
    var limitContent = 20000;
    $scope.terminals = [];
    var mySocket = new socketService($scope, '/', '/');
    mySocket.connectSocket();
    mySocket.on('terminals:initialize', function(data){
        $scope.terminals = [];
        data.containers.forEach(function(container){
            $scope.terminals.push({
                id: container.Id,
                title: container.Names[0],
                content: ''
            });
        });
    });

    mySocket.on('terminal:logs', function(data){
        $scope.terminals.forEach(function(terminal){
            if(terminal.id == data.id){
                terminal.content += '<br>';
                terminal.content += $sce.trustAsHtml(data.logs);
            }
            if(terminal.content.length > limitContent){
                terminal.content = terminal.content.substring(0, 4000);
            }
        });
    });

    $scope.removeTerminal = function(index){
        $scope.terminals.splice(index, 1);
    };
}


})();
