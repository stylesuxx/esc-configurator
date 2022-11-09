import Source from '../Source';

class BLHeliSource extends Source {
  buildDisplayName(flash, make) {
    const {
      MAIN_REVISION, SUB_REVISION,
    } = flash.settings;
    let revision = 'Unsupported/Unrecognized';
    if(MAIN_REVISION !== undefined && SUB_REVISION !== undefined) {
      revision = `${MAIN_REVISION}.${SUB_REVISION}`;
    }

    if (flash.actualMake) {
      make += ` (Probably mistagged: ${flash.actualMake})`;
    }

    return `${make} - ${this.name}, ${revision}`;
  }

  getFirmwareUrl({
    escKey, mode, url,
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

export default BLHeliSource;
