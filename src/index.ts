import getGeocoder from 'src/getGeocoder';
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
  NominatimMapQuestOptions,
  TomTomOptions,
  VirtualEarthOptions,
  SmartOptions,
  TeleportOptions,
  OpenDataFranceOptions,
  MapBoxOptions
} from 'src/getGeocoder';

export default getGeocoder;
export type * from 'src/types';
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
  NominatimMapQuestOptions,
  TomTomOptions,
  VirtualEarthOptions,
  SmartOptions,
  TeleportOptions,
  OpenDataFranceOptions,
  MapBoxOptions
}
export type { Provider } from 'src/provider/providers';

// type guards for the lack of specificity on the geocoder methods
export {
  isBatchResultFormatted,
  isBatchResultWithProvider,
  isResultFormatted,
  isResultWithProvider,
  isProvider
} from 'src/Geocoder';
