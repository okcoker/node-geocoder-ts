import { AllAdapterOptions } from 'lib/geocoderfactory';
import {
  HTTPAdapter,
  AbstractGeocoder,
  AbstractGeocoderAdapter,
  Location,
  Result,
  ResultCallback,
  GeocodeValue,
  BatchResultCallback
} from 'types';

export function buildHttpAdapter(overrides = {}): HTTPAdapter {
  return {
    options: {},

    supportsHttps() {
      return true;
    },

    get() {
      return {};
    },

    post() {
      return {};
    },
    ...overrides
  };
}

export function buildResult(overrides = {}): Result {
  return {
    data: [],
    raw: {},
    ...overrides
  };
}

export function buildGeocoderAdapter<T extends AllAdapterOptions>(
  overrides = {}
): AbstractGeocoderAdapter<T> {
  return {
    name: 'google',

    httpAdapter: buildHttpAdapter(),

    options: {} as T,

    reverse(query: Location, callback: ResultCallback) {
      callback(null, buildResult());
    },

    geocode(value: GeocodeValue, callback: ResultCallback) {
      callback(null, buildResult());
    },

    batchGeocode(values: GeocodeValue[], callback: BatchResultCallback) {
      callback(null, { data: [] });
    },

    ...overrides
  };
}

export function buildGeocoder(overrides = {}): AbstractGeocoder<any> {
  return {
    _adapter: buildGeocoderAdapter(overrides),
    ...buildGeocoderAdapter(overrides),
    ...overrides
  };
}
