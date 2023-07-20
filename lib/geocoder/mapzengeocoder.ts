import querystring from 'querystring';
import BaseAbstractGeocoder from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  BaseOptions,
  Location,
  GeocodeValue,
  ResultData
} from '../../types';

export interface Options extends BaseOptions {
  provider: 'mapzen';
  apiKey: string;
}

class MapzenGeocoder extends BaseAbstractGeocoder<Options> {
  _endpoint = 'https://search.mapzen.com/v1';

  constructor(httpAdapter: HTTPAdapter, options: Options) {
    super(httpAdapter, options);

    if (!options.apiKey) {
      throw new Error(this.constructor.name + ' needs an apiKey');
    }
  }

  _geocode(value: GeocodeValue, callback: ResultCallback) {
    this.httpAdapter.get(
      this._endpoint + '/search',
      {
        text: value as string,
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

  _reverse(query: Location, callback: ResultCallback) {
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
