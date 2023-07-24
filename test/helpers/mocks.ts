import type { AllAdapterOptions } from 'lib/geocoderfactory';
import type { Provider } from 'lib/providers';
import type {
  HTTPAdapter,
  AbstractGeocoder,
  AbstractGeocoderAdapter,
  ReverseQuery,
  Result,
  GeocodeQuery,
  BatchResult
} from 'types';

export function buildHttpAdapter(overrides = {}): HTTPAdapter {
  return {
    options: {},

    supportsHttps() {
      return true;
    },

    get<T>(): Promise<T> {
      return Promise.resolve({} as T)
    },

    post<T>(): Promise<T> {
      return Promise.resolve({} as T)
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

    reverse(_query: ReverseQuery): Promise<Result> {
      return Promise.resolve({
        raw: '',
        data: []
      })
    },

    geocode(_query: GeocodeQuery): Promise<Result> {
      return Promise.resolve({
        raw: '',
        data: []
      })
    },

    batchGeocode(_queries: GeocodeQuery[]): Promise<BatchResult> {
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

    reverse(_query: ReverseQuery): Promise<Result> {
      return this._adapter.reverse(_query)
    },

    geocode(_query: GeocodeQuery): Promise<Result> {
      return this._adapter.geocode(_query)
    },

    batchGeocode(_queries: GeocodeQuery[]): Promise<BatchResult> {
      return this._adapter.batchGeocode(_queries)
    },

    ...overrides
  };
}
