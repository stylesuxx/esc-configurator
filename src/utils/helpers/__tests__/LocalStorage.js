import blheliConfig from '../../../sources/Blheli';
import am32Config from '../../../sources/AM32';
import bluejayConfig from '../../../sources/Bluejay';

const populateLocalStorage = async() => {
  await blheliConfig.getEscs();
  await am32Config.getEscs();
  await bluejayConfig.getEscs();
};

export default populateLocalStorage;
