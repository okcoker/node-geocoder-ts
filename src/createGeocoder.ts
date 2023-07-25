import Geocoder, { isProvider } from './Geocoder';

import FetchAdapter from './httpadapter/FetchAdapter';

import GpxFormatter, {
  Options as GpxFormatterOptions
} from './formatter/GpxFormatter';
import StringFormatter, {
  Options as StringFormatterOptions
} from './formatter/StringFormatter';

import GoogleGeocoder, {
  Options as GoogleOptions
} from './provider/google/GoogleProvider';
import HereGeocoder, { Options as HereOptions } from './provider/here/HereProvider';
import AGOLProvider, { Options as AGOLOptions } from './provider/agol/AGOLProvider';
import FreegeoipProvider, {
  Options as FreegeoipOptions
} from './provider/freegeoip/FreegeoipProvider';
import DataScienceToolkitProvider, {
  Options as DataScienceToolkitOptions
} from './provider/datasciencetoolkit/DataScienceToolkitProvider';
import OpenStreetMapProvider, {
  Options as OpenStreetMapOptions
} from './provider/openstreetmap/OpenStreetMapProvider';
import PickPointProvider, {
  Options as PickPointOptions
} from './provider/pickpoint/PickPointProvider';
import LocationIQProvider, {
  Options as LocationIQOptions
} from './provider/locationiq/LocationIQProvider';
import MapQuestProvider, {
  Options as MapQuestOptions
} from './provider/mapquest/MapQuestProvider';
import MapzenProvider, {
  Options as MapzenOptions
} from './provider/mapzen/MapzenProvider';
import OpenMapQuestProvider, {
  Options as OpenMapQuestOptions
} from './provider/openmapquest/OpenMapQuestProvider';
import YandexProvider, {
  Options as YandexOptions
} from './provider/yandex/YandexProvider';
import GeocodioProvider, {
  Options as GeocodioOptions
} from './provider/geocodio/GeocodioProvider';
import OpenCageProvider, {
  Options as OpenCageOptions
} from './provider/opencage/OpenCageProvider';
import NominatimMapQuestProvider, {
  Options as NominatimMapQuestOptions
} from './provider/nominatim/NominatimMapQuestProvider';
import TomTomProvider, {
  Options as TomTomOptions
} from './provider/tomtom/TomTomProvider';
import VirtualEarthProvider, {
  Options as VirtualEarthOptions
} from './provider/virtualearth/VirtualEarthProvider';
import SmartyStreetsProvider, {
  Options as SmartOptions
} from './provider/smartystreets/SmartyStreetsProvider';
import TeleportProvider, {
  Options as TeleportOptions
} from './provider/teleport/TeleportProvider';
import OpenDataFranceProvider, {
  Options as OpenDataFranceOptions
} from './provider/opendatafrance/OpenDataFranceProvider';
import MapBoxProvider, {
  Options as MapBoxOptions
} from './provider/mapbox/MapboxProvider';

import type {
  HttpAdapterType,
  AbstractGeocoder,
  AbstractGeocoderAdapter,
  Formatter,
  HTTPAdapter,
  HTTPAdapterBaseOptions,
  FormatterName
} from 'src/types';
import type { Provider } from 'src/provider/providers';

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
      return new AGOLProvider(adapter, options) as any;
    case 'freegeoip':
      return new FreegeoipProvider(adapter, options) as any;
    case 'datasciencetoolkit':
      return new DataScienceToolkitProvider(adapter, options) as any;
    case 'openstreetmap':
      return new OpenStreetMapProvider(adapter, options) as any;
    case 'pickpoint':
      return new PickPointProvider(adapter, options) as any;
    case 'locationiq':
      return new LocationIQProvider(adapter, options) as any;
    case 'mapquest':
      return new MapQuestProvider(adapter, options) as any;
    case 'mapzen':
      return new MapzenProvider(adapter, options) as any;
    case 'openmapquest':
      return new OpenMapQuestProvider(adapter, options) as any;
    case 'yandex':
      return new YandexProvider(adapter, options) as any;
    case 'geocodio':
      return new GeocodioProvider(adapter, options) as any;
    case 'opencage':
      return new OpenCageProvider(adapter, options) as any;
    case 'nominatimmapquest':
      return new NominatimMapQuestProvider(adapter, options) as any;
    case 'tomtom':
      return new TomTomProvider(adapter, options) as any;
    case 'virtualearth':
      return new VirtualEarthProvider(adapter, options) as any;
    case 'smartystreets':
      return new SmartyStreetsProvider(adapter, options) as any;
    case 'teleport':
      return new TeleportProvider(adapter, options) as any;
    case 'opendatafrance':
      return new OpenDataFranceProvider(adapter, options) as any;
    case 'mapbox':
      return new MapBoxProvider(adapter, options) as any;
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
  | NominatimMapQuestOptions
  | TomTomOptions
  | VirtualEarthOptions
  | SmartOptions
  | TeleportOptions
  | OpenDataFranceOptions
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
  NominatimMapQuestOptions,
  TomTomOptions,
  VirtualEarthOptions,
  SmartOptions,
  TeleportOptions,
  OpenDataFranceOptions,
  MapBoxOptions
};
