import type { Provider } from 'lib/providers';
export type Adapter =
  | 'fetch'

export interface BaseOptions {
  provider: Provider;
  fetch?: (url: RequestInfo, init?: RequestInit) => Promise<Response> | undefined;
  timeout?: number;
  formatterPattern?: string;
  formatter?: Formatter;
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

export interface NodeCallback<T> {
  (err: any, result?: undefined | null): void;
  (err: undefined | null, result: T): void;
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

export interface FormatterOptions {
  name: FormatterName
}

export interface Formatter<T extends FormatterOptions> {
  options: Omit<T, 'name'>;
  format: (data: ResultData[]) => string | string[];
}

export interface HTTPAdapter {
  supportsHttps(): boolean;
  get<T>(url: string, params: Record<string, any>, callback: NodeCallback<T>, fullResponse?: boolean): void
  post<T>(url: string, params: Record<string, any>, options: any, callback: NodeCallback<T>, fullResponse?: boolean): void
}


export type GeocodeObject = Record<string, string | number | string[] | number[]>
export type GeocodeValue = string | GeocodeObject

export interface AbstractGeocoderMethods {
  reverse(query: Location, callback: ResultCallback): void;

  geocode(value: GeocodeValue, callback: ResultCallback): void;

  batchGeocode(values: GeocodeValue[], callback: BatchResultCallback): void;
}

export interface AbstractGeocoderAdapter extends AbstractGeocoderMethods {
  name: Provider;
}

export interface AbstractGeocoder extends AbstractGeocoderMethods {
  _adapter: AbstractGeocoderAdapter
}


export type Nullable<T> = T | null

