# SOAM

Forwad your Dockerized SOA or microservices based app logs to browser.

## Usage as a Container

### Docker Compose

```
cat >docker-compose.yml <<EOF
soam:
  image: quay.io/geniousphp/soam:0.1
  volumes:
  - /var/run/docker.sock:/var/run/docker.sock
  ports:
  - "28778:28778"
  privileged: true
  environment: #All these env variables are optionals
  - PORT=28778
  - DOCKER_SOCKET=/var/run/docker.sock 
  - SHOW_LOG_BY_LABEL=soam.log

#SOAM will show this service log because of "soam.log" label
service:
    ...
    labels:
    - "soam.log=yes"
EOF
docker-compose up
```

see it on http://localhost:28778

## Roadmap

* Improve UI
* Add logs filtering



## License

MIT