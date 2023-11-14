#!/bin/bash -eux

# Port on your local machine that you want esc-configurator to be listening on
LOCAL_PORT=8234

# Fetch tag of latest release version
VERSION=$(curl --silent "https://api.github.com/repos/stylesuxx/esc-configurator/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')

docker  buildx \
        build \
        --build-arg VERSION=$VERSION \
        --progress plain \
        --platform linux/amd64 \
        -t esc-configurator:latest \
        .

docker  run \
        -i \
        -d --publish $LOCAL_PORT:1234 \
        --privileged \
        -v /dev/bus/usb:/dev/bus/usb \
        esc-configurator:latest

# This bit tries to guess the binary name of google chrome
BIN1=google-chrome
BIN2=google-chrome-stable
BIN3=google-chrome-stable

if (which $BIN1 &>/dev/null); then
    $BIN1 http://localhost:$LOCAL_PORT
elif (which $BIN2 &>/dev/null); then
    $BIN2 http://localhost:$LOCAL_PORT
elif (which $BIN3 &>/dev/null); then
    $BIN3 http://localhost:$LOCAL_PORT
else
    echo
    echo "The $BIN1 binary was not found on this machine."
    echo "It is required to open esc-configurator."
    echo "Exiting."
    echo
    exit 1
fi
