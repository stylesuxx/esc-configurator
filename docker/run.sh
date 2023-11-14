#!/bin/bash

docker  buildx \
        build \
        --progress plain \
        --platform linux/amd64 \
        -t esc-configurator:latest \
        .

docker  run \
        -i \
        -d --publish 1234:1234 \
        --privileged \
        -v /dev/bus/usb:/dev/bus/usb \
        esc-configurator:latest

google-chrome-stable http://localhost:1234

