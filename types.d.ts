import type { Provider } from 'lib/providers';
export type HttpAdapterType =
  | 'fetch'

export interface BaseAdapterOptions {
  provider: Provider;
}

export interface Location {
  lat: number;
  lon: number;
}

export interface ResultData {
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  extra?:
  | {
    googlePlaceId?: string;
    confidence?: number;
  }
  ;
  administrativeLevels?:
  | {
    level1long?: string;
    level1short?: string;
    level2long?: string;
    level2short?: string;
  }
  ;
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

export interface NodeCallback<T> {
  (err: any, result: null): void;
  (err: any, result: T): void;
}

export interface ResultCallback {
  (err: any, result: null): void;
  (err: null, result: Result): void;
}

export interface BatchResultCallback {
  (err: any, result: null): void;
  (err: null, result: BatchResult): void;
}

export interface Query {
  address?: string;
  country?: string;
  countryCode?: string;
  zipcode?: string;
  minConfidence?: number;
  limit?: number;
}

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
  get<T>(url: string, params: Record<string, any>, callback: NodeCallback<T>, fullResponse?: boolean): void
  post<T>(url: string, params: Record<string, any>, options: any, callback: NodeCallback<T>, fullResponse?: boolean): void
}

export type HTTPAdapterBaseOptions = {
  fetch?: (url: RequestInfo, init?: RequestInit) => Promise<Response>;
  userAgent?: string;
  timeout?: number;
};


export type GeocodeObject = Record<string, string | number | string[] | number[]>
export type GeocodeValue = string | GeocodeObject

export interface AbstractGeocoderMethods {
  reverse(query: Location): Promise<AllResultTypes>;

  geocode(value: GeocodeValue): Promise<AllResultTypes>;

  batchGeocode(values: GeocodeValue[]): Promise<AllBatchResultTypes>;
}

export interface AbstractGeocoderAdapterMethods {
  _reverse?(query: Location, callback: ResultCallback): void;

  _geocode?(value: GeocodeValue, callback: ResultCallback): void;

  _batchGeocode?(values: GeocodeValue[], callback: BatchResultCallback): void;

  reverse(query: Location): Promise<Result>;

  geocode(value: GeocodeValue): Promise<Result>;

  batchGeocode(values: GeocodeValue[]): Promise<BatchResult>;
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

export type Nullable<T> = T | null

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
