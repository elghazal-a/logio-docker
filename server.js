var fs      		= require('fs');
var express         = require('express');   
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
var showLogByLabel 	= process.env.SHOW_LOG_BY_LABEL || 'soam.log';

app.set('port', process.env.PORT || 28778);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.get('/', function(req, res){res.render('index'); });
app.use(express.static(path.join(__dirname, 'public')));

		
io.on('connection', function (socket){
	docker.listContainers({all: true }, function(err, containers){
		containers = containers.filter(function(container){
			return (container.Labels) && 
			(container.Labels.hasOwnProperty(showLogByLabel));
		});
		socket.emit('terminals:initialize', { containers: containers });

		containers.forEach(function(container){
			var data = toEmit(container);
			docker.getContainer(container.Id).logs({
				follow: true, 
				stdout: true, 
				stderr: true, 
				tail: 20
			}, function (err, stream) {
			  	var filter = parser(data, {
			  		json: false,
			  		newline: true
			  	})
				stream.pipe(filter)
				filter.on('data', function(chunk){
					socket.emit('terminal:logs', {
						id: container.Id,
						logs: ansi_up.ansi_to_html(chunk.line)
					});
				});
			});
		});
	});
});


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