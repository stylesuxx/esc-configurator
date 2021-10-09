import Source from '../Source';

class BLHeliSource extends Source {
  buildDisplayName(flash, make) {
    const settings = flash.settings;
    let revision = 'Unsupported/Unrecognized';
    if(settings.MAIN_REVISION !== undefined && settings.SUB_REVISION !== undefined) {
      revision = `${settings.MAIN_REVISION}.${settings.SUB_REVISION}`;
    }

    if (flash.actualMake) {
      make += ` (Probably mistagged: ${flash.actualMake})`;
    }

    return `${make} - ${this.name}, ${revision}`;
  }

  getFirmwareUrl({
    escKey, version, mode, url,
  }) {
    const format = (str2Format, ...args) =>
      str2Format.replace(/(\{\d+\})/g, (a) => args[+(a.substr(1, a.length - 2)) || 0]);

    const name = this.escs.layouts[escKey].name.replace(/[\s-]/g, '_').toUpperCase();

    const formattedUrl = format(
      url,
      name,
      mode
    );

    return formattedUrl;
  }
}

export {
  BLHeliSource,
};
