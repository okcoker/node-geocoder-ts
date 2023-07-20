import Geocoder from './geocoder';

import FetchAdapter, { FetchAdapterOptions } from './httpadapter/fetchadapter';

import GpxFormatter, {
  Options as GpxFormatterOptions
} from './formatter/gpxformatter';
import StringFormatter, {
  Options as StringFormatterOptions
} from './formatter/stringformatter';

import GoogleGeocoder, {
  Options as GoogleOptions
} from './geocoder/googlegeocoder';
import HereGeocoder, { Options as HereOptions } from './geocoder/heregeocoder';
import AGOLGeocoder, { Options as AGOLOptions } from './geocoder/agolgeocoder';
import FreegeoipGeocoder, {
  Options as FreegeoipOptions
} from './geocoder/freegeoipgeocoder';
import DataScienceToolkitGeocoder, {
  Options as DataScienceToolkitOptions
} from './geocoder/datasciencetoolkitgeocoder';
import OpenStreetMapGeocoder, {
  Options as OpenStreetMapOptions
} from './geocoder/openstreetmapgeocoder';
import PickPointGeocoder, {
  Options as PickPointOptions
} from './geocoder/pickpointgeocoder';
import LocationIQGeocoder, {
  Options as LocationIQOptions
} from './geocoder/locationiqgeocoder';
import MapQuestGeocoder, {
  Options as MapQuestOptions
} from './geocoder/mapquestgeocoder';
import MapzenGeocoder, {
  Options as MapzenOptions
} from './geocoder/mapzengeocoder';
import OpenMapQuestGeocoder, {
  Options as OpenMapQuestOptions
} from './geocoder/openmapquestgeocoder';
import YandexGeocoder, {
  Options as YandexOptions
} from './geocoder/yandexgeocoder';
import GeocodioGeocoder, {
  Options as GeocodioOptions
} from './geocoder/geocodiogeocoder';
import OpenCageGeocoder, {
  Options as OpenCageOptions
} from './geocoder/opencagegeocoder';
import NominatimMapquestGeocoder, {
  Options as NominatimMapquestOptions
} from './geocoder/nominatimmapquestgeocoder';
import TomTomGeocoder, {
  Options as TomTomOptions
} from './geocoder/tomtomgeocoder';
import VirtualEarthGeocoder, {
  Options as VirtualEarthOptions
} from './geocoder/virtualearth';
import SmartyStreets, {
  Options as SmartOptions
} from './geocoder/smartystreetsgeocoder';
import TeleportGeocoder, {
  Options as TeleportOptions
} from './geocoder/teleportgeocoder';
import OpendataFranceGeocoder, {
  Options as OpendataFranceOptions
} from './geocoder/opendatafrancegeocoder';
import MapBoxGeocoder, {
  Options as MapBoxOptions
} from './geocoder/mapboxgeocoder';

import type { Adapter, AbstractGeocoder, Formatter, HTTPAdapter } from 'types';
import type { Provider } from 'lib/providers';

/**
 * Return an http adapter by name
 * @param  <string> adapterName adapter name
 * @return <object>
 */
function _getHttpAdapter(
  adapterName: Adapter,
  options?: FetchAdapterOptions
): HTTPAdapter {
  return new FetchAdapter(options);
}
/**
 * Return a geocoder adapter by name
 * @param  adapter - Name of fetch adapter
 * @param  options - Adapter options
 */
function _getGeocoder(
  adapter: HTTPAdapter,
  options: AllAdapterOptions
): AbstractGeocoder {
  switch (options.provider) {
    case 'google':
      return new GoogleGeocoder(adapter, options);
    case 'here':
      return new HereGeocoder(adapter, options);
    case 'agol':
      return new AGOLGeocoder(adapter, options);
    case 'freegeoip':
      return new FreegeoipGeocoder(adapter, options);
    case 'datasciencetoolkit':
      return new DataScienceToolkitGeocoder(adapter, options);
    case 'openstreetmap':
      return new OpenStreetMapGeocoder(adapter, options);
    case 'pickpoint':
      return new PickPointGeocoder(adapter, options);
    case 'locationiq':
      return new LocationIQGeocoder(adapter, options);
    case 'mapquest':
      return new MapQuestGeocoder(adapter, options);
    case 'mapzen':
      return new MapzenGeocoder(adapter, options);
    case 'openmapquest':
      return new OpenMapQuestGeocoder(adapter, options);
    case 'yandex':
      return new YandexGeocoder(adapter, options);
    case 'geocodio':
      return new GeocodioGeocoder(adapter, options);
    case 'opencage':
      return new OpenCageGeocoder(adapter, options);
    case 'nominatimmapquest':
      return new NominatimMapquestGeocoder(adapter, options);
    case 'tomtom':
      return new TomTomGeocoder(adapter, options);
    case 'virtualearth':
      return new VirtualEarthGeocoder(adapter, options);
    case 'smartystreets':
      return new SmartyStreets(adapter, options);
    case 'teleport':
      return new TeleportGeocoder(adapter, options);
    case 'opendatafrance':
      return new OpendataFranceGeocoder(adapter, options);
    case 'mapbox':
      return new MapBoxGeocoder(adapter, options);
  }
}

/**
 * Return an formatter adapter by name
 * @param  <string> adapterName adapter name
 * @return <object>
 */
function _getFormatter(
  options: AllFormatterOptions['formatter']
): Formatter<any> | undefined {
  if (options?.name === 'gpx') {
    return new GpxFormatter(options);
  }

  if (options?.name === 'string') {
    return new StringFormatter(options);
  }
}

// @todo type this better so we can get the actual geocoder type
// based on the `Provider`
function getGeocoder<T>(geocoderAdapter: Provider): T;
function getGeocoder<T extends AbstractGeocoder>(
  geocoderAdapter: Provider,
  options: Omit<FactoryOptions, 'provider'>
): T;
function getGeocoder<T extends AbstractGeocoder>(
  geocoderAdapter: FactoryOptions
): T;
function getGeocoder(
  geocoderAdapter: Provider | FactoryOptions,
  options?: FactoryOptions | Omit<FactoryOptions, 'provider'>
): AbstractGeocoder {
  const defaultProvider: Provider = 'google';
  const geocoderOptions: FactoryOptions = (typeof geocoderAdapter === 'object'
    ? geocoderAdapter
    : { provider: defaultProvider, formatter: undefined, ...options }) || {
    provider: defaultProvider,
    fetch: undefined,
    formatter: undefined
  };
  const httpAdapter = _getHttpAdapter('fetch', geocoderOptions);
  const adapter = _getGeocoder(httpAdapter, geocoderOptions);
  let formatter: Formatter<any> | undefined;

  if (geocoderOptions.formatter) {
    formatter = _getFormatter(geocoderOptions.formatter);
  }

  return new Geocoder(adapter, formatter);
}

type AllAdapterOptions =
  | GoogleOptions
  | HereOptions
  | AGOLOptions
  | FreegeoipOptions
  | DataScienceToolkitOptions
  | OpenStreetMapOptions
  | PickPointOptions
  | LocationIQOptions
  | MapQuestOptions
  | MapzenOptions
  | OpenMapQuestOptions
  | YandexOptions
  | GeocodioOptions
  | OpenCageOptions
  | NominatimMapquestOptions
  | TomTomOptions
  | VirtualEarthOptions
  | SmartOptions
  | TeleportOptions
  | OpendataFranceOptions
  | MapBoxOptions;

interface AllFormatterOptions {
  formatter: GpxFormatterOptions | StringFormatterOptions;
}

type FactoryOptions = FetchAdapterOptions &
  AllAdapterOptions &
  AllFormatterOptions;

export default getGeocoder;
export {
  AllAdapterOptions,
  AllFormatterOptions,
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
};
