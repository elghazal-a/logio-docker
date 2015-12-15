FROM mhart/alpine-node:0.12

MAINTAINER Elghazal Ahmed <geniousphp@gmail.com>

ENV NODE_ENV production

WORKDIR /app

ADD . .

RUN apk add --update make gcc g++ python
RUN npm install
RUN apk del make gcc g++ python && \
	rm -rf /tmp/* /var/cache/apk/* /root/.npm /root/.node-gyp
RUN chmod +x ./boot.sh

EXPOSE  28778

CMD ["/bin/sh", "boot.sh"]