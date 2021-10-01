import {
  am32Source,
  blheliSSource,
  blheliSource,
  blheliSilabsSource,
  bluejaySource,
} from '../../../sources';

const populateLocalStorage = async() => {
  await am32Source.getEscs();
  await blheliSSource.getEscs();
  // await blheliSilabsSource.getEscs();
  await blheliSource.getEscs();
  await bluejaySource.getEscs();
};

export default populateLocalStorage;
