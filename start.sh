#!/bin/bash
/usr/bin/google-chrome http://localhost:3333
NODE_ENV=production node server.js $1
