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
}

export {
  BLHeliSource, 
};
