import getGeocoder from 'lib/geocoderfactory';
import type {
  AllAdapterOptions,
  AllSubFormatterOptions,
  FactoryOptions,
  GpxFormatterOptions,
  StringFormatterOptions,
  GoogleOptions,
  HereOptions,
  AGOLOptions,
  FreegeoipOptions,
  DataScienceToolkitOptions,
  OpenStreetMapOptions,
  PickPointOptions,
  LocationIQOptions,
  MapQuestOptions,
  MapzenOptions,
  OpenMapQuestOptions,
  YandexOptions,
  GeocodioOptions,
  OpenCageOptions,
  NominatimMapquestOptions,
  TomTomOptions,
  VirtualEarthOptions,
  SmartOptions,
  TeleportOptions,
  OpendataFranceOptions,
  MapBoxOptions
} from 'lib/geocoderfactory';

export default getGeocoder;
export type * from 'types';
export type {
  AllAdapterOptions,
  AllSubFormatterOptions,
  FactoryOptions,
  GpxFormatterOptions,
  StringFormatterOptions,
  GoogleOptions,
  HereOptions,
  AGOLOptions,
  FreegeoipOptions,
  DataScienceToolkitOptions,
  OpenStreetMapOptions,
  PickPointOptions,
  LocationIQOptions,
  MapQuestOptions,
  MapzenOptions,
  OpenMapQuestOptions,
  YandexOptions,
  GeocodioOptions,
  OpenCageOptions,
  NominatimMapquestOptions,
  TomTomOptions,
  VirtualEarthOptions,
  SmartOptions,
  TeleportOptions,
  OpendataFranceOptions,
  MapBoxOptions
}
export type { Provider } from 'lib/providers';

// type guards for the lack of specificity on the geocoder methods
export {
  isBatchResultFormatted,
  isBatchResultWithProvider,
  isResultFormatted,
  isResultWithProvider,
  isProvider
} from 'lib/geocoder';
