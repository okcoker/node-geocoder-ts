import type { AllAdapterOptions } from 'src/createGeocoder';
import type { Provider } from 'src/provider/providers';
import type {
  HTTPAdapter,
  AbstractGeocoder,
  AbstractGeocoderAdapter as AbstractProviderAdapter,
  ReverseQuery,
  Result,
  GeocodeQuery,
  BatchResult
} from 'src/types';

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

export function buildProviderAdapter<T extends AllAdapterOptions>(
  overrides = {}
): AbstractProviderAdapter<T> {
  return {
    name: 'google' as T['provider'],

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
    _adapter: buildProviderAdapter<Extract<AllAdapterOptions, { provider: T }>>(overrides),

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
