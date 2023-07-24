import type { Provider } from 'lib/providers';
export type HttpAdapterType =
  | 'fetch'

export interface BaseAdapterOptions {
  provider: Provider;
}

export interface ResultData {
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  extra?:
  // Google
  | {
    googlePlaceId?: string;
    confidence?: number;
  }
  // Mapbox
  | {
    id?: string;
    address?: string;
    category?: string;
    bbox?: number[];
  }
  ;
  administrativeLevels?:
  | {
    level1long?: string;
    level1short?: string;
    level2long?: string;
    level2short?: string;
  };
  city?: string;
  streetName?: string;
  streetNumber?: string;
  country?: string;
  countryCode?: string;
  zipcode?: string;
  provider?: string;
  state?: string;
  stateCode?: string;
  county?: string;
  district?: string;
  building?: string;

  // Found these in agol
  address?: string;
  neighborhood?: string;
  loc_name?: string;
}

export interface ResultDataWithProvider extends ResultData {
  provider: Provider;
}

export interface Result {
  data: ResultData[];
  raw: any;
}

export interface ResultWithProvider {
  data: ResultDataWithProvider[];
  raw: any;
}

export interface ResultFormatted {
  data: ReturnType<Formatter<any>['format']>;
  raw: any;
}

type Success<T> = {
  data: T;
  error: null
}
type Failure = {
  data: null;
  error: any;
}

export type MaybeResultMaybeError = Success<Result> | Failure;
export type MaybeResultWithProviderMaybeError = Success<ResultWithProvider> | Failure;
export type MaybeResultFormattedMaybeError = Success<ResultFormatted> | Failure;

export interface BatchResult {
  data: MaybeResultMaybeError[];
}

export interface BatchResultWithProvider {
  data: MaybeResultWithProviderMaybeError[];
}

export interface BatchResultFormatted {
  data: MaybeResultFormattedMaybeError[];
}

export type AllResultTypes = ResultWithProvider | Result | ResultFormatted;
export type AllBatchResultTypes = BatchResult | BatchResultWithProvider | BatchResultFormatted;

export type FormatterName =
  | 'gpx'
  | 'string';

export interface BaseFormatterOptions {
  name: FormatterName
}

export interface Formatter<T extends BaseFormatterOptions> {
  options: Omit<T, 'name'>;
  format: (data: ResultData[]) => string | string[];
}

export interface HTTPAdapter {
  options: HTTPAdapterBaseOptions;
  supportsHttps(): boolean;
  get<T = any>(url: string, params: Record<string, any>, fullResponse?: boolean): Promise<T>
  post<T = any>(url: string, params: Record<string, any>, fetchOptions: RequestInit, fullResponse?: boolean): Promise<T>
}

export type HTTPAdapterBaseOptions = RequestInit & {
  fetch?: (url: RequestInfo, init?: RequestInit) => Promise<Response>;
  timeout?: number;
};


export type GeocodeObject = Record<string, string | number | string[] | number[]>
export type GeocodeQuery = string | GeocodeObject

export interface ReverseQuery {
  lat: number;
  lon: number;
}
export interface AbstractGeocoderMethods {
  reverse(query: ReverseQuery): Promise<AllResultTypes>;

  geocode(query: GeocodeQuery): Promise<AllResultTypes>;

  batchGeocode(queries: GeocodeQuery[]): Promise<AllBatchResultTypes>;
}

export interface AbstractGeocoderAdapterMethods {
  _reverse?(query: ReverseQuery): Promise<Result>;

  _geocode?(query: GeocodeQuery): Promise<Result>;

  _batchGeocode?(values: GeocodeQuery[]): Promise<BatchResult>;

  reverse(query: ReverseQuery): Promise<Result>;

  geocode(query: GeocodeQuery): Promise<Result>;

  batchGeocode(queries: GeocodeQuery[]): Promise<BatchResult>;
}

export interface AbstractGeocoderAdapter<T extends BaseAdapterOptions> extends AbstractGeocoderAdapterMethods {
  name: T['provider'];
  options: T;
  httpAdapter: HTTPAdapter;
}

export interface AbstractGeocoder<T extends Provider> extends AbstractGeocoderMethods {
  _adapter: AbstractGeocoderAdapter<Extract<AllAdapterOptions, { provider: T }>>;
  _formatter?: Formatter<any>;
}

export type Nullable<T> = T | null;

export type FetchImplementation = (url: RequestInfo, init?: RequestInit) => Promise<Response>;

// https://stackoverflow.com/a/69288824/1048847
export type Expand<T> = T extends (...args: infer A) => infer R
  ? (...args: Expand<A>) => Expand<R>
  : T extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

export type ExpandRecursively<T> = T extends (...args: infer A) => infer R
  ? (...args: ExpandRecursively<A>) => ExpandRecursively<R>
  : T extends object
  ? T extends infer O
  ? { [K in keyof O]: ExpandRecursively<O[K]> }
  : never
  : T;
