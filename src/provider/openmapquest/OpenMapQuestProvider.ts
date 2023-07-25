import querystring from 'querystring';
import BaseAbstractProviderAdapter from '../BaseAbstractProviderAdapter';
import type {
  HTTPAdapter,
  BaseAdapterOptions,
  ReverseQuery,
  GeocodeQuery,
  ResultData,
  Result
} from 'src/types';
import ResultError from 'src/utils/error/ResultError';

export interface Options extends BaseAdapterOptions {
  provider: 'openmapquest';
  apiKey: string;
}

const MQConfidenceLookup = {
  POINT: 1,
  ADDRESS: 0.9,
  INTERSECTION: 0.8, //less accurate than the MQ description
  STREET: 0.7,
  ZIP: 0.5,
  ZIP_EXTENDED: 0.5,
  NEIGHBORHOOD: 0.5,
  CITY: 0.4,
  COUNTY: 0.3,
  STATE: 0.2,
  COUNTRY: 0.1
};

class OpenMapQuestProvider extends BaseAbstractProviderAdapter<Options> {
  _endpoint = 'https://open.mapquestapi.com/geocoding/v1';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = { apiKey: '' }
  ) {
    super(httpAdapter, { ...options, provider: 'openmapquest' });
    if (!options.apiKey) {
      throw new Error(this.constructor.name + ' needs an apiKey');
    }
  }

  override async _geocode(value: GeocodeQuery): Promise<Result> {
    const result = await this.httpAdapter.get(this._endpoint + '/address', {
      location: value,
      key: querystring.unescape(this.options.apiKey)
    });
    if (!result) {
      throw new ResultError(this);
    }

    if (
      typeof result.info?.statuscode !== 'undefined' &&
      result.info?.statuscode !== 0
    ) {
      throw new Error(
        'Status is ' + result.info.statuscode + ' ' + result.info.messages[0]
      );
    }

    const results = (result.results?.[0]?.locations || []).map((data: any) => {
      return this._formatResult(data);
    });

    return {
      data: results,
      raw: result
    };
  }

  _formatResult(result: any): ResultData {
    return {
      latitude: result.latLng.lat,
      longitude: result.latLng.lng,
      // 'country': null,
      countryCode: result.adminArea1,
      city: result.adminArea5,
      state: result.adminArea3,
      zipcode: result.postalCode,
      streetName: result.street,
      // 'streetNumber': null,
      extra: {
        confidence:
          MQConfidenceLookup[
            result.geocodeQuality as keyof typeof MQConfidenceLookup
          ] || 0
      }
    };
  }

  override async _reverse(query: ReverseQuery): Promise<Result> {
    const lat = query.lat;
    const lng = query.lon;

    const result = await this.httpAdapter.get(this._endpoint + '/reverse', {
      location: lat + ',' + lng,
      key: querystring.unescape(this.options.apiKey)
    });
    if (!result) {
      throw new ResultError(this);
    }

    const results = (result.results?.[0]?.locations || []).map((data: any) => {
      return this._formatResult(data);
    });
    return {
      data: results,
      raw: result
    };
  }
}

export default OpenMapQuestProvider;
