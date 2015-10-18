#!/bin/bash

if [ -e "/opt/etc/hosts" ]
then
	sed -i /127\.0\.0\.1.$VIRTUAL_HOST/d /opt/etc/hosts
	echo "127.0.0.1 $VIRTUAL_HOST" >> /opt/etc/hosts
fi
node server.js