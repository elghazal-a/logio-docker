var fs      		= require('fs');
var _ 	     		= require('lodash');
var express         = require('express');   
var errorhandler	= require('errorhandler');   
var app          	= module.exports = express();
var server       	= require('http').Server(app);
var io           	= require('socket.io')(server);
var path         	= require('path');
var ansi_up      	= require('ansi_up');
var Docker  		= require('dockerode');
var parser 			= require('./parser')

var socket  		= process.env.DOCKER_SOCKET || '/var/run/docker.sock';
var stats   		= fs.statSync(socket);
if (!stats.isSocket()) {
  throw new Error('Are you sure the docker is running?');
}
var docker 			= new Docker({ socketPath: socket });
var showLogByLabel 	= process.env.SHOW_LOG_BY_LABEL || 'logio';
var showAllLogs 	= process.env.SHOW_ALL_LOGS || false;

var Logs = {};
var mySocket = null;
var Stream;

app.set('port', process.env.PORT || 28778);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.get('/', function(req, res){res.render('index'); });
app.use(express.static(path.join(__dirname, 'public')));
if ('development' == app.get('env') || 'test' == app.get('env')) {
  app.use(errorhandler({ log : true}));
}
else{
    app.use(function(err, req, res, next) {
        res.status(500);
        res.end();
    });
}



var fetchLogs = function(containers, mySocketId){
	containers.forEach(function(container){
		Logs[mySocketId][container.Id] = '';
		var data = toEmit(container);
		docker.getContainer(container.Id).logs({
			follow: true, 
			stdout: true, 
			stderr: true, 
			tail: 50
		}, function (err, stream) {
		  	var filter = parser(data, {
		  		json: false,
		  		newline: true
		  	})
			stream.pipe(filter);
			filter.on('data', function(chunk){
				Logs[mySocketId][container.Id] += '<br>';
				Logs[mySocketId][container.Id] += ansi_up.ansi_to_html(chunk.line);
			});
		});
	});
	
}


io.on('connection', function (socket){
	console.log('New Socket.io connection');
	mySocket = socket;
	Logs[mySocket.id] = {};
	docker.listContainers({all: true }, function(err, containers){
		if(!showAllLogs){
			containers = containers.filter(function(container){
				return (container.Labels) && 
				(container.Labels.hasOwnProperty(showLogByLabel));
			});
		}
		fetchLogs(containers, mySocket.id);
		socket.emit('terminals:initialize', { containers: containers });
	});
});


function sendLogs(containerId, logs){
	mySocket.emit('terminal:logs', {
		id: containerId,
		logs: logs
	});
}
setInterval(function(){
	if(mySocket == null || !Logs[mySocket.id]) return;
	for (var containerId in Logs[mySocket.id]) {
		if (Logs[mySocket.id][containerId].length > 0) {
			sendLogs(containerId, Logs[mySocket.id][containerId])
			Logs[mySocket.id][containerId] = [];
		}
	}
}, 500);


function toEmit(container) {
    return {
      	id: container.Id,
      	image: container.Image,
      	name: container.Names[0].replace(/^\//, '')
    }
}

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});