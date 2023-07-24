import querystring from 'querystring';
import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,
  BaseAdapterOptions,
  ReverseQuery,
  GeocodeQuery,
  ResultData,
  Result
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

  override async _geocode(query: GeocodeQuery): Promise<Result> {
    const result = await this.httpAdapter.get(
      this._endpoint + '/search',
      {
        text: query as string,
        api_key: querystring.unescape(this.options.apiKey)
      },
    );

    if (result.error) {
      throw new Error('Status is ' + result.error);
    }

    const results = result.features.map((feature: any) => {
      return this._formatResult(feature);
    });

    return {
      raw: result,
      data: results
    };
  }

  override async _reverse(query: ReverseQuery): Promise<Result> {
    const lat = query.lat;
    const lng = query.lon;

    const result = await this.httpAdapter.get(
      this._endpoint + '/reverse',
      {
        'point.lat': lat,
        'point.lon': lng,
        api_key: querystring.unescape(this.options.apiKey)
      }
    );

    const results = result.results.map((data: any) => {
      return this._formatResult(data);
    });

    return {
      raw: result,
      data: results
    };
  }

  private _formatResult(result: any): ResultData {
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

}

export default MapzenGeocoder;
