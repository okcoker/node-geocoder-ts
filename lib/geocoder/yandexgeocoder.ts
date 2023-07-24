import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  BaseAdapterOptions,
  ReverseQuery,
  ResultData
} from '../../types';

export interface Options extends BaseAdapterOptions {
  provider: 'yandex';
  apiKey: string;
  /**
   * ex: `ru_RU`, `uk_UA`
   */
  language?: string;
  /**
   * defaults to 10
   */
  results?: number;
  /**
   * defaults to 0
   */
  skip?: number;
  /**
   * Type of toponym (only for reverse geocoding)
   * ex: `house`, `street`, `metro`, `district`, `locality`
   */
  kind?: string;
  /**
   * ex: `[{lat: 1.0, lng:2.0},{lat: 1.1, lng:2.2}]`
   */
  bbox?: [{ lat: number; lng: number }, { lat: number; lng: number }];
  /**
   * Limit search in bbox (1) or not limit (0)
   */
  rspn?: string;
}

class YandexGeocoder extends BaseAbstractGeocoderAdapter<Options> {
  // Yandex geocoding API endpoint
  _endpoint = 'https://geocode-maps.yandex.ru/1.x/';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = { apiKey: '' }
  ) {
    super(httpAdapter, { ...options, provider: 'yandex' });
  }

  override _geocode(value: string, callback: ResultCallback) {
    const params = {
      ..._processOptionsToParams(this.options),
      geocode: value,
      format: 'json'
    };

    this.httpAdapter.get(this._endpoint, params, (err: any, result: any) => {
      if (err || !result) {
        return callback(err, null);
      }

      const results = result.response.GeoObjectCollection.featureMember.map((geopoint: any) => {
        return _formatResult(geopoint);
      });

      callback(null, {
        raw: result,
        data: results
      });
    });
  }

  override _reverse(query: ReverseQuery, callback: ResultCallback) {
    const lat = query.lat;
    const lng = query.lon;

    const value = lng + ',' + lat;

    this._geocode(value, callback);
  }
}

function _formatResult(result: any): ResultData {
  const position = result.GeoObject.Point.pos.split(' ');
  const data =
    result.GeoObject.metaDataProperty.GeocoderMetaData.AddressDetails;

  return {
    latitude: parseFloat(position[1]),
    longitude: parseFloat(position[0]),
    city: _findKey(data, 'LocalityName'),
    state: _findKey(data, 'AdministrativeAreaName'),
    streetName: _findKey(data, 'ThoroughfareName'),
    streetNumber: _findKey(data, 'PremiseNumber'),
    countryCode: _findKey(data, 'CountryNameCode'),
    country: _findKey(data, 'CountryName'),
    formattedAddress: _findKey(data, 'AddressLine')
  };
}

function _processOptionsToParams(
  options: Options
): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (options.language) {
    params.lang = options.language;
  }

  if (options.results) {
    params.results = options.results;
  }

  if (options.skip) {
    params.skip = options.skip;
  }

  if (options.kind) {
    params.kind = options.kind;
  }

  if (options.bbox) {
    if (options.bbox.length === 2) {
      params.bbox = options.bbox[0].lng + ',' + options.bbox[0].lat;
      params.bbox = params.bbox + '~';
      params.bbox =
        params.bbox + options.bbox[1].lng + ',' + options.bbox[1].lat;
    }
  }

  if (options.rspn) {
    params.rspn = options.rspn;
  }

  if (options.apiKey) {
    params.apikey = options.apiKey;
  }

  return params;
}

function _findKey(result: any, wantedKey: string): string | undefined {
  let val;
  Object.keys(result).every(function (key) {
    if (key === wantedKey) {
      val = result[key];
      return false;
    }

    if (typeof result[key] === 'object') {
      val = _findKey(result[key], wantedKey);

      return val === null ? true : false;
    }

    return true;
  });

  return val;
}

export default YandexGeocoder;
