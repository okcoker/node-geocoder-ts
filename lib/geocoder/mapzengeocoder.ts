import querystring from 'querystring';
import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  BaseAdapterOptions,
  ReverseQuery,
  GeocodeQuery,
  ResultData
} from '../../types';

export interface Options extends BaseAdapterOptions {
  provider: 'mapzen';
  apiKey: string;
}

class MapzenGeocoder extends BaseAbstractGeocoderAdapter<Options> {
  _endpoint = 'https://search.mapzen.com/v1';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = { apiKey: '' }
  ) {
    super(httpAdapter, { ...options, provider: 'mapzen' });

    if (!options.apiKey) {
      throw new Error(this.constructor.name + ' needs an apiKey');
    }
  }

  override _geocode(query: GeocodeQuery, callback: ResultCallback) {
    this.httpAdapter.get(
      this._endpoint + '/search',
      {
        text: query as string,
        api_key: querystring.unescape(this.options.apiKey)
      },
      (err: any, result: any) => {
        if (err) {
          return callback(err, null);
        }

        if (result.error) {
          return callback(new Error('Status is ' + result.error), null);
        }

        const results = result.features.map((feature: any) => {
          return this._formatResult(feature);
        });

        callback(null, {
          raw: result,
          data: results
        });
      }
    );
  }

  _formatResult(result: any): ResultData {
    const accuracy =
      result.properties.confidence < 1 ? result.properties.confidence - 0.1 : 1;

    return {
      latitude: result.geometry.coordinates[1],
      longitude: result.geometry.coordinates[0],
      country: result.properties.country,
      city: result.properties.locality,
      state: result.properties.region,
      // 'zipcode': null,
      streetName: result.properties.street,
      streetNumber: result.properties.housenumber,
      countryCode: result.properties.country_a,
      extra: {
        confidence: accuracy || 0
      }
    };
  }

  override _reverse(query: ReverseQuery, callback: ResultCallback) {
    const lat = query.lat;
    const lng = query.lon;

    this.httpAdapter.get(
      this._endpoint + '/reverse',
      {
        'point.lat': lat,
        'point.lon': lng,
        api_key: querystring.unescape(this.options.apiKey)
      },
      (err: any, result: any) => {
        if (err) {
          return callback(err, null);
        }

        const results = result.results.map((data: any) => {
          return this._formatResult(data);
        });

        callback(null, {
          raw: result,
          data: results
        });
      }
    );
  }
}

export default MapzenGeocoder;
