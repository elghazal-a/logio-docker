# SOAM

Forward your Dockerized stack logs to a nice looking browser based UI.

## Features
* Forward your containers logs to a browser based UI (inspired by [logio](http://logio.org/))
* Show logs in real-time (powered by [socket.io](http://socket.io/))
* Filter containers by label
* Filter within logs
* Support multiple screens
* SOAM is dockerized and built on Alpine Linux (~40MB)

## Usage as a Container

### Docker

```
docker run -d -p 28778:28778 -e SHOW_ALL_LOGS=true -v /var/run/docker.sock:/var/run/docker.sock --name=soam geniousphp/soam
```

### Docker-compose

```
cat >docker-compose.yml <<EOF
soam:
  image: geniousphp/soam
  volumes:
  - /var/run/docker.sock:/var/run/docker.sock
  ports:
  - "28778:28778"
  privileged: true
  environment: #All these env variables are optionals
  - PORT=28778
  - DOCKER_SOCKET=/var/run/docker.sock 
  - SHOW_LOG_BY_LABEL=soam.log

#SOAM will show logs for this service because of "soam.log" label
service:
    ...
    labels:
    - "soam.log=yes"
EOF

docker-compose up -d
```

See it on `http://localhost:28778`

## Usage as a Node.js app

```
git clone https://github.com/geniousphp/soam.git
cd soam
npm install
SHOW_ALL_LOGS=true node server.js
```
See it on `http://localhost:28778`

## Config
SOAM is configurable via environment variables

* `PORT=28778`: set the port (optionel)
* `SHOW_ALL_LOGS=true`: this variable is required in order to show logs for all containers (required)
* `SHOW_LOG_BY_LABEL=soam.log`: if `SHOW_ALL_LOGS` wasn't set, SOAM will filter containers by `soam.log` label (optionel)
* `DOCKER_SOCKET=/var/run/docker.sock`: set the docker socket path (optionel)

## UI

![alt tag](https://raw.githubusercontent.com/geniousphp/soam/master/public/ui.png)

## License

MIT
