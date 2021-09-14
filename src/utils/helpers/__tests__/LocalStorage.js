import {
  am32Source,
  blheliSource,
  bluejaySource,
} from '../../../sources';

const populateLocalStorage = async() => {
  await am32Source.getEscs();
  await blheliSource.getEscs();
  await bluejaySource.getEscs();
};

export default populateLocalStorage;
