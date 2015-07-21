(function(){
'use strict'
var soam = angular.module('soam');


soam.factory('socketService',[
  '$safeApply', 
  function ($safeApply) {
  
  return function($scope, base, channel){
    this.url = base + channel;
    this.socket = {};
 
    this.connectSocket = function(){
      this.socket = io(this.url, {
        forceNew: true
      });
    };
    this.disconnectSocket = function(){
      this.socket.removeAllListeners();
      this.socket.disconnect();
      delete this.socket;
    };

    this.on = function (eventName, callback) {
      var that = this;
      this.socket.on(eventName, function () {  
        var args = arguments;
        $safeApply($scope, function () {
          callback.apply(that.socket, args);
        });
      });
    };
    this.emit = function (eventName, data, callback) {
      var that = this;
      this.socket.emit(eventName, data, function () {
        var args = arguments;
        $safeApply($scope, function () {
          if (callback) {
            callback.apply(that.socket, args);
          }
        });
      })
    };
    
  };
}]);


})();


