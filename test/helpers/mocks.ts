import type { AllAdapterOptions } from 'lib/geocoderfactory';
import type { Provider } from 'lib/providers';
import type {
  HTTPAdapter,
  AbstractGeocoder,
  AbstractGeocoderAdapter,
  Location,
  Result,
  ResultCallback,
  GeocodeValue,
  BatchResultCallback,
  BatchResult
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

    _reverse(_query: Location, callback: ResultCallback) {
      callback(null, buildResult());
    },

    _geocode(_value: GeocodeValue, callback: ResultCallback) {
      callback(null, buildResult());
    },

    _batchGeocode(_values: GeocodeValue[], callback: BatchResultCallback) {
      callback(null, { data: [] });
    },

    reverse(_query: Location): Promise<Result> {
      return Promise.resolve({
        raw: '',
        data: []
      })
    },

    geocode(_value: GeocodeValue): Promise<Result> {
      return Promise.resolve({
        raw: '',
        data: []
      })
    },

    batchGeocode(_values: GeocodeValue[]): Promise<BatchResult> {
      return Promise.resolve({
        raw: '',
        data: []
      })
    },

    ...overrides
  };
}


export function buildGeocoder<T extends Provider>(overrides = {}): AbstractGeocoder<T> {
  return {
    _adapter: buildGeocoderAdapter<Extract<AllAdapterOptions, { provider: T }>>(overrides),

    reverse(_query: Location): Promise<Result> {
      return Promise.resolve({
        raw: '',
        data: []
      })
    },

    geocode(_value: GeocodeValue): Promise<Result> {
      return Promise.resolve({
        raw: '',
        data: []
      })
    },

    batchGeocode(_values: GeocodeValue[]): Promise<BatchResult> {
      return Promise.resolve({
        raw: '',
        data: []
      })
    },

    ...overrides
  };
}
