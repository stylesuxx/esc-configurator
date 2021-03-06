# Bluejay PWA
A webapp to flash your BLHELI_S capable ESC's directly from the web using the [Web Serial API](https://wicg.github.io/serial/).

> The latest state of the master branch can be [viewed in the browser](https://sad-goodall-6b6045.netlify.app/)

This is basically a complete re-write of the original BLHELI_S configurator. Some bits and pieces have been re-used.

I mainly did this since I was interested in having this as an web app, but also because the original BLHELI_S configurator code was too much for me to re-factor and I thought I might re-write it in the same amount of time.

I also tried to go with one front-end framework - React. Instead of having a mixture of lots of different stuff.

I re-used most of the look and feel of the original configurator, but since this is used on the web, adaptations to style are very much welcome. In the long run I can see this also be used on mobile phones via OTG port.

## Dev Setup
Simply clone the repository, install dependencies and run the dev server. Pull requests are more than welcome.

Search the codes for TODO or IMPROVEMENTS, there is a lot that still can be done.

### Install dependencies

    yarn

### Start dev server

    yarn start

### Build

    yarn build

The build is then available from the build directory and can be served by simply hosting the content of the directory.
