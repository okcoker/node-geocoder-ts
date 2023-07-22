import BaseAbstractGeocoder from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  BaseAdapterOptions,
  Location,
  GeocodeValue,
  ResultData
} from '../../types';

export interface Options extends BaseAdapterOptions {
  provider: 'openstreetmap';
  language?: string;
  email?: string;
  apiKey?: string;
  osmServer?: string;
  zoom?: number;
}

class OpenStreetMapGeocoder extends BaseAbstractGeocoder<Options> {
  _endpoint: string;
  _endpoint_reverse: string;

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = {}
  ) {
    super(httpAdapter, { ...options, provider: 'openstreetmap' });

    const osmServer = options.osmServer || 'http://nominatim.openstreetmap.org';
    this._endpoint = osmServer + '/search';
    this._endpoint_reverse = osmServer + '/reverse';
  }

  _geocode(value: GeocodeValue, callback: ResultCallback) {
    const params = this._getCommonParams();
    params.addressdetails = 1;
    if (typeof value == 'string') {
      params.q = value;
    } else {
      const obj = value as Record<string, any>;
      for (const k in obj) {
        const v = obj[k];
        params[k] = v;
      }
    }
    this._forceParams(params);

    this.httpAdapter.get(this._endpoint, params, (err: any, result: any) => {
      if (err) {
        return callback(err, null);
      } else {
        if (result.error) {
          return callback(new Error(result.error), null);
        }
        let results: ResultData[] = [];

        if (result instanceof Array) {
          results = result.map((data: any) => {
            return this._formatResult(data);
          });
        } else {
          results = [this._formatResult(result)];
        }

        callback(null, {
          raw: result,
          data: results
        });
      }
    });
  }

  _formatResult(result: any): ResultData {
    let countryCode = result.address.country_code;
    if (countryCode) {
      countryCode = countryCode.toUpperCase();
    }

    let latitude = result.lat;
    if (latitude) {
      latitude = parseFloat(latitude);
    }

    let longitude = result.lon;
    if (longitude) {
      longitude = parseFloat(longitude);
    }

    return {
      latitude: latitude,
      longitude: longitude,
      formattedAddress: result.display_name,
      country: result.address.country,
      city:
        result.address.city ||
        result.address.town ||
        result.address.village ||
        result.address.hamlet,
      state: result.address.state,
      zipcode: result.address.postcode,
      streetName: result.address.road || result.address.cycleway,
      streetNumber: result.address.house_number,
      countryCode: countryCode,
      // Does this even exist for osm?
      // https://nominatim.org/release-docs/latest/api/Reverse/
      neighborhood: result.address.neighborhood
    };
  }

  _reverse(
    query: Location & {
      format?: 'xml' | 'json';
      addressdetails?: number;
      zoom?: number;
    },
    callback: ResultCallback
  ) {
    const params = this._getCommonParams();
    const record = query as Record<string, any>;

    for (const k in query) {
      const v = record[k];
      params[k] = v;
    }
    this._forceParams(params);

    this.httpAdapter.get(
      this._endpoint_reverse,
      params,
      (err: any, result: any) => {
        if (err) {
          return callback(err, null);
        } else {
          if (result.error) {
            return callback(new Error(result.error), null);
          }

          let results: ResultData[] = [];
          if (result instanceof Array) {
            results = result.map((data: any) => {
              return this._formatResult(data);
            });
          } else {
            result = [this._formatResult(result)];
          }

          callback(null, {
            raw: result,
            data: results
          });
        }
      }
    );
  }

  /**
   * Prepare common params
   *
   * @return <Object> common params
   */
  _getCommonParams(): Record<string, any> {
    const params: Record<string, any> = {};
    const options = this.options as Record<string, any>;

    for (let k in options) {
      const v = options[k];
      if (!v) {
        continue;
      }
      if (k === 'language') {
        k = 'accept-language';
      }
      params[k] = v;
    }

    return params;
  }

  _forceParams(params: any): Record<string, any> {
    return {
      ...params,
      format: 'json',
      addressdetails: 1
    };
  }
}

export default OpenStreetMapGeocoder;
