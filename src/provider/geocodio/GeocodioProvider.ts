import querystring from 'querystring';
import BaseAbstractProviderAdapter from '../BaseAbstractProviderAdapter';
import type {
  HTTPAdapter,
  ReverseQuery,
  ResultData,
  BaseAdapterOptions,
  Result
} from 'src/types';
import ResultError from 'src/utils/error/ResultError';

export interface Options extends BaseAdapterOptions {
  provider: 'geocodio';
  apiKey: string;
}

/**
 * Constructor
 */
class GeocodioProvider extends BaseAbstractProviderAdapter<Options> {
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

  override async _geocode(query: string): Promise<Result> {
    const result = await this.httpAdapter.get(
      this._endpoint + '/geocode',
      {
        q: query,
        api_key: querystring.unescape(this.options.apiKey)
      }
    );

    if (!result) {
      throw new ResultError(this);
    }

    if (result.error) {
      throw new Error('Status is ' + result.error);
    }

    const results = result.results.map((location: any) => {
      return this._formatResult(location);
    });

    return {
      data: results,
      raw: result
    };
  }

  _formatResult(result: any): ResultData {
    const accuracy = result.accuracy < 1 ? result.accuracy - 0.1 : 1;
    return {
      latitude: result.location.lat,
      longitude: result.location.lng,
      country: result.address_components?.country,
      formattedAddress: result.formatted_address,
      city: result.address_components?.city,
      state: result.address_components?.state,
      zipcode: result.address_components?.zip,
      streetName: result.address_components?.formatted_street,
      streetNumber: result.address_components?.number,
      // countryCode: null,
      extra: {
        confidence: accuracy || 0
      }
    };
  }

  override async _reverse(query: ReverseQuery): Promise<Result> {
    const lat = query.lat;
    const lng = query.lon;

    const result = await this.httpAdapter.get(
      this._endpoint + '/reverse',
      {
        q: lat + ',' + lng,
        api_key: querystring.unescape(this.options.apiKey)
      }
    );

    if (!result) {
      throw new ResultError(this);
    }

    const results = result.results.map((location: any) => {
      return this._formatResult(location);
    });

    return {
      data: results,
      raw: result
    };
  }
}

export default GeocodioProvider;
