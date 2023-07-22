import Geocoder, { isProvider } from './geocoder';

import FetchAdapter from './httpadapter/fetchadapter';

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

import type {
  HttpAdapterType,
  AbstractGeocoder,
  AbstractGeocoderAdapter,
  Formatter,
  HTTPAdapter,
  HTTPAdapterBaseOptions,
  FormatterName
} from 'types';
import type { Provider } from 'lib/providers';

/**
 * Return an http adapter by name
 */
function _getHttpAdapter(
  adapterName: HttpAdapterType,
  options?: HTTPAdapterBaseOptions
): HTTPAdapter {
  return new FetchAdapter(options);
}

// @todo fix these to not need `as any`
/**
 * Return a geocoder adapter by name
 */
function _getGeocoderAdapter<T extends AllAdapterOptions>(
  adapter: HTTPAdapter,
  options: T
): AbstractGeocoderAdapter<Extract<T, { provider: T['provider'] }>> {
  switch (options.provider) {
    case 'google':
      return new GoogleGeocoder(adapter, options) as any;
    case 'here':
      return new HereGeocoder(adapter, options) as any;
    case 'agol':
      return new AGOLGeocoder(adapter, options) as any;
    case 'freegeoip':
      return new FreegeoipGeocoder(adapter, options) as any;
    case 'datasciencetoolkit':
      return new DataScienceToolkitGeocoder(adapter, options) as any;
    case 'openstreetmap':
      return new OpenStreetMapGeocoder(adapter, options) as any;
    case 'pickpoint':
      return new PickPointGeocoder(adapter, options) as any;
    case 'locationiq':
      return new LocationIQGeocoder(adapter, options) as any;
    case 'mapquest':
      return new MapQuestGeocoder(adapter, options) as any;
    case 'mapzen':
      return new MapzenGeocoder(adapter, options) as any;
    case 'openmapquest':
      return new OpenMapQuestGeocoder(adapter, options) as any;
    case 'yandex':
      return new YandexGeocoder(adapter, options) as any;
    case 'geocodio':
      return new GeocodioGeocoder(adapter, options) as any;
    case 'opencage':
      return new OpenCageGeocoder(adapter, options) as any;
    case 'nominatimmapquest':
      return new NominatimMapquestGeocoder(adapter, options) as any;
    case 'tomtom':
      return new TomTomGeocoder(adapter, options) as any;
    case 'virtualearth':
      return new VirtualEarthGeocoder(adapter, options) as any;
    case 'smartystreets':
      return new SmartyStreets(adapter, options) as any;
    case 'teleport':
      return new TeleportGeocoder(adapter, options) as any;
    case 'opendatafrance':
      return new OpendataFranceGeocoder(adapter, options) as any;
    case 'mapbox':
      return new MapBoxGeocoder(adapter, options) as any;
  }
}

/**
 * @todo fix types
 * Return an formatter adapter by name
 * @param  <string> adapterName adapter name
 * @return <object>
 */
function _getFormatter<T extends FormatterOptions>(
  options: T
):
  | Formatter<Extract<AllSubFormatterOptions, { name: T['formatter'] }>>
  | undefined {
  switch (options?.formatter) {
    case 'gpx':
      // eslint-disable-next-line
      // @ts-expect-error
      return new GpxFormatter(options.formatterOptions);
    case 'string':
      // eslint-disable-next-line
      // @ts-expect-error
      return new StringFormatter(options.formatterOptions);
    default:
      return;
  }
}

// @todo type this better so we can get the actual geocoder type
// based on the `Provider`
/**
 * Geocoder factory which creates geocoder with the specified provider and/or options
 * @param providerOrOptions
 */
function getGeocoder<T extends Provider>(
  providerOrOptions: T
): AbstractGeocoder<T>;
function getGeocoder<T extends Provider>(
  providerOrOptions: T,
  options: Omit<Extract<FactoryOptions, { provider: T }>, 'provider'>
): AbstractGeocoder<T>;
function getGeocoder<T extends FactoryOptions>(
  providerOrOptions: T
): AbstractGeocoder<T['provider']>;
function getGeocoder<T extends Provider | FactoryOptions>(
  providerOrOptions: T,
  options?: Omit<FactoryOptions, 'provider'>
): AbstractGeocoder<
  T extends Provider ? T : T extends FactoryOptions ? T['provider'] : never
> {
  if (typeof providerOrOptions === 'string' && !isProvider(providerOrOptions)) {
    throw new Error(`No geocoder provider found for: ${providerOrOptions}`)
  }

  const geocoderOptions = (typeof providerOrOptions === 'object'
    ? providerOrOptions as FactoryOptions
    : {
      provider: providerOrOptions as Provider,
      ...options
    });
  const httpAdapter = _getHttpAdapter('fetch', geocoderOptions);
  const adapter = _getGeocoderAdapter(httpAdapter, geocoderOptions as AllAdapterOptions);
  const formatter = _getFormatter(geocoderOptions);

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

type AllSubFormatterOptions = GpxFormatterOptions | StringFormatterOptions;

type FormatterOptions = {
  formatter?: FormatterName;
  formatterOptions?: FormatterOptions['formatter'] extends undefined
  ? undefined
  : Omit<
    Extract<
      AllSubFormatterOptions,
      { name: FormatterOptions['formatter'] }
    >,
    'name'
  >;
};

type FactoryOptions = HTTPAdapterBaseOptions &
  AllAdapterOptions &
  FormatterOptions;

export default getGeocoder;
export {
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
};
