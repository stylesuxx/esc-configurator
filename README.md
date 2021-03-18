<img align="right" src="./public/logo512.png" alt="ESC Configurator" width="250">

[![Crowdin](https://badges.crowdin.net/esc-configuratorcom/localized.svg)](https://crowdin.com/project/esc-configuratorcom)

# ESC Configurator - PWA
A webapp to flash your BLHELI_S capable ESC's directly from the web using the [Web Serial API](https://wicg.github.io/serial/).

> The latest state of the master branch can be [viewed in the browser](https://esc-configurator.com)

This is basically a complete re-write of the original BLHELI_S configurator. Some bits and pieces have been re-used.

I mainly did this since I was interested in having this as an web app, but also because the original BLHELI_S configurator code was too much for me to re-factor and I thought I might re-write it in the same amount of time.

I also tried to go with one front-end framework - React. Instead of having a mixture of lots of different stuff.

I re-used most of the look and feel of the original configurator, but since this is used on the web, adaptations to style are very much welcome. In the long run I can see this also be used on mobile phones via OTG port.

## Supported Platforms & Frimware
Currently only the SiLab EMF8 MCU's are supported with the following firmware:

* Blheli_S
* Bluejay

### Adding new firmware
If you are a firmware developer please feel free to drop an issue so I can add your firmware. Look at how Blheli and Bluejay are implemented.

If your firmware is based on Blheli, make sure that you set a NAME in your layout - this allows me to easily identify which firmware is flashed and act accordingly.

### Adding new platforms
Right now only SiLabs EFM8 MCU's are supported. But a lot of ARM and Atmel related code is ported, just the flashing is not implemented. If you want to see those features added and are willing to help, please tell me so in the issue section.

## Translations
Translations are managed via [crowdin](https://crowdin.com/project/esc-configuratorcom) so head on over there and contribute to the translations. Should your language not be enabled yet, let me know in the issues and I will add it.

## Contributing
Contributions are very welcome. Feel free to submit PR's and discuss feature requests - I am open for all suggestions.

### Dev Setup
Simply clone the repository, install dependencies and run the dev server. Pull requests are more than welcome.

Search the codes for TODO or IMPROVEMENTS, there is a lot that still can be done.

#### Install dependencies

    yarn

#### Start dev server

    yarn start

#### Build

    yarn build

The build is then available from the build directory and can be served by simply hosting the content of the directory.
