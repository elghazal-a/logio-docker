(function(){
'use strict';

var soam = angular.module('soam', [ 
	'SafeApply',
	'ngSanitize',
	'luegg.directives'
 ]);


soam.controller('containersCtrl', ['$scope',
	'$rootScope',
	'$sce',
	'socketService',
	containersCtrl
]);


function containersCtrl($scope, $rootScope, $sce, socketService){
	var mySocket = new socketService($scope, '/', '/');
	mySocket.connectSocket();

	var limitContent = 20000;
	var terminalHeights = 96;
	var history = {};
	/*
		{
			id: container id,
			title: container name,
			terminal: terminal id
		}
	*/
	$scope.containers = [];

	/*
		{
			id: terminal id,
			logs: logs,
			filterBy: filter
		}
	*/
	$scope.terminals = [];

	mySocket.on('terminal:logs', function(data){
		var trustedLogs = $sce.trustAsHtml(data.logs);
		history[data.id] += trustedLogs;
        if(history[data.id].length > limitContent){
            history[data.id] = history[data.id].slice(4000);
            history[data.id] = history[data.id].slice(history[data.id].indexOf("<br>"));
        }
	    $scope.containers.forEach(function(container){
	        if(container.id == data.id){
	        	$scope.terminals.forEach(function(terminal, i){
	        		if(terminal.id == container.terminal){
	            		terminal.logs += trustedLogs;
	        		}
		            if(terminal.logs.length > limitContent){
		                terminal.logs = terminal.logs.slice(4000);
		                terminal.logs = terminal.logs.slice(terminal.logs.indexOf("<br>"));
		            }
	        	});
	        }
	    });
	});


	$scope.showLogs = function($event, previousTerminalId, containerId, terminalId){
		if($event.target.checked){
			//We have checked the checkbox
			
			//Remove logs if container logs was shown in an other terminal
			for (var i = 0; i < $scope.terminals.length; i++) {
				if($scope.terminals[i].id == previousTerminalId){
					$scope.terminals[i].logs = '';
				}
			}
			//Assign the new terminalId to this container
			for (var i = 0; i < $scope.containers.length; i++) {
				if($scope.containers[i].terminal == terminalId){
					$scope.containers[i].terminal = -1;
				}

				if($scope.containers[i].id == containerId){
					$scope.containers[i].terminal = terminalId;
				}
			}
			//Put the containerId's history inside terminalId
			for (var i = 0; i < $scope.terminals.length; i++) {
				if($scope.terminals[i].id == terminalId){
					$scope.terminals[i].logs = history[containerId];
				}
			}

		}
		else{
			//We have unchecked the checkbox
			for (var i = 0; i < $scope.containers.length; i++) {
				if($scope.containers[i].id == containerId){
					$scope.containers[i].terminal = -1;
				}
			}
			//remove terminal logs
			for (var i = 0; i < $scope.terminals.length; i++) {
				if($scope.terminals[i].id == terminalId){
					$scope.terminals[i].logs = '';
				}
			}
		}
	}

	mySocket.on('terminals:initialize', function(data){
		$scope.containers = [];
		data.containers.forEach(function(container){
			$scope.containers.push({
				id: container.Id,
				title: container.Names[0],
				terminal: -1
			});
			history[container.Id] = '';
		});
		if($scope.containers.length > 0){
			$scope.terminals = [{
				id: 0,
				logs: ''
			}];
			$scope.containers[0].terminal = 0;
			$scope.dynamicHeight = terminalHeights + 'vh';
		}
	});

	$scope.newTerminal = function(){
		$scope.terminals.push({
			id: $scope.terminals[$scope.terminals.length - 1].id + 1,
			logs: ''
		});
		$scope.dynamicHeight = terminalHeights/$scope.terminals.length + 'vh';
	}
	$scope.removeTerminal = function(index){
		$scope.terminals.splice(index, 1);
		$scope.dynamicHeight = terminalHeights/$scope.terminals.length + 'vh';
	};

	$scope.clearTerminal = function(index){
		$scope.terminals[index].logs = '';
	};
}

soam.filter('filterLogs', function(){
    return function(logs, filterString){
    	if(undefined === filterString || null === filterString || filterString == '')
    		return logs;

    	var re = new RegExp(filterString, 'g');

        return logs.split('<br>')
        .filter(function(string){
    		return string.indexOf(filterString) >= 0;
    	})
        .join('<br>')
        .replace(re, '<span class="highlight">' + filterString + '</span>');
    }
});

})();
