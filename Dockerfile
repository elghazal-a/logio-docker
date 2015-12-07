FROM mhart/alpine-node:base-0.12.9

MAINTAINER Elghazal Ahmed <geniousphp@gmail.com>

ENV NODE_ENV production

WORKDIR /app

ADD . .

RUN chmod +x ./boot.sh

EXPOSE  28778

CMD ["/bin/sh", "boot.sh"]