import querystring from 'querystring';
import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  ReverseQuery,
  ResultData,
  BaseAdapterOptions
} from 'types';

export interface Options extends BaseAdapterOptions {
  provider: 'geocodio';
  apiKey: string;
}

/**
 * Constructor
 */
class GeocodioGeocoder extends BaseAbstractGeocoderAdapter<Options> {
  _endpoint = 'https://api.geocod.io/v1';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = { apiKey: '' }
  ) {
    super(httpAdapter, { ...options, provider: 'geocodio' });

    if (!options.apiKey) {
      throw new Error(this.constructor.name + ' needs an apiKey');
    }
  }

  override _geocode(value: any, callback: ResultCallback) {
    this.httpAdapter.get(
      this._endpoint + '/geocode',
      {
        q: value,
        api_key: querystring.unescape(this.options.apiKey)
      },
      (err: any, result: any) => {
        if (err || !result) {
          return callback(err, null);
        }

        if (result.error) {
          return callback(new Error('Status is ' + result.error), null);
        }

        const results = result.results.map((location: any) => {
          return this._formatResult(location);
        });

        callback(null, {
          data: results,
          raw: result
        });
      }
    );
  }

  _formatResult(result: any): ResultData {
    const accuracy = result.accuracy < 1 ? result.accuracy - 0.1 : 1;
    return {
      latitude: result.location.lat,
      longitude: result.location.lng,
      country: result.address_components.country,
      formattedAddress: result.formatted_address,
      city: result.address_components.city,
      state: result.address_components.state,
      zipcode: result.address_components.zip,
      streetName: result.address_components.formatted_street,
      streetNumber: result.address_components.number,
      // countryCode: null,
      extra: {
        confidence: accuracy || 0
      }
    };
  }

  override  _reverse(query: ReverseQuery, callback: ResultCallback) {
    const lat = query.lat;
    const lng = query.lon;

    this.httpAdapter.get(
      this._endpoint + '/reverse',
      {
        q: lat + ',' + lng,
        api_key: querystring.unescape(this.options.apiKey)
      },
      (err: any, result: any) => {
        if (err || !result) {
          return callback(err, null);
        }

        const results = result.results.map((location: any) => {
          return this._formatResult(location);
        });

        callback(null, {
          data: results,
          raw: result
        });
      }
    );
  }
}

export default GeocodioGeocoder;
