FROM mhart/alpine-node:0.12

MAINTAINER Elghazal Ahmed <geniousphp@gmail.com>

ENV NODE_ENV production

WORKDIR /app

RUN apk add --update make gcc g++ python

COPY . /app

RUN npm install
RUN apk del make gcc g++ python && \
	rm -rf /tmp/* /var/cache/apk/* /root/.npm /root/.node-gyp

EXPOSE  28778

CMD ["node", "server.js"]