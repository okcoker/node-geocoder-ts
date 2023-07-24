import querystring from 'querystring';
import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,

  BaseAdapterOptions,
  ReverseQuery,
  GeocodeQuery,
  ResultData,
  Result
} from 'types';
import ResultError from 'lib/error/ResultError';

export interface Options extends BaseAdapterOptions {
  provider: 'mapquest';
  apiKey: string;
}

class MapQuestGeocoder extends BaseAbstractGeocoderAdapter<Options> {
  _endpoint = 'https://www.mapquestapi.com/geocoding/v1';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = { apiKey: '' }
  ) {
    super(httpAdapter, { ...options, provider: 'mapquest' });

    if (!options.apiKey) {
      throw new Error('MapQuestGeocoder needs an apiKey');
    }
  }

  override async _geocode(value: GeocodeQuery): Promise<Result> {
    const params: Record<string, any> = {
      key: querystring.unescape(this.options.apiKey)
    };

    if (typeof value === 'object') {
      if (value.address) {
        params.street = value.address;
      }
      if (value.country) {
        params.country = value.country;
      }
      if (value.zipcode) {
        params.postalCode = value.zipcode;
      }
      if (value.city) {
        params.city = value.city;
      }
    } else {
      params.location = value;
    }

    const result = await this.httpAdapter.get(
      this._endpoint + '/address',
      params
    )
    if (!result) {
      throw new ResultError(this);
    }

    if (typeof result.info?.statuscode !== 'undefined' && result.info?.statuscode !== 0) {
      throw new Error(
        'Status is ' +
        result.info.statuscode +
        ' ' +
        result.info.messages[0]
      )
    }

    const results = (result.results || []).reduce(
      (acc: ResultData[], data: any) => {
        data.locations.forEach((location: any) => {
          acc.push(this._formatResult(location));
        });
        return acc;
      },
      [] as ResultData[]
    );

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
        location: lat + ',' + lng,
        key: querystring.unescape(this.options.apiKey)
      })

    if (!result) {
      throw new ResultError(this);
    }

    const locations = result.results?.[0]?.locations || [];
    const results = locations.map(this._formatResult);

    return {
      raw: result,
      data: results
    };
  }

  private _formatResult(result: any): ResultData {
    return {
      formattedAddress: [
        result.street,
        result.adminArea5,
        (result.adminArea3 + ' ' + result.postalCode).trim(),
        result.adminArea1
      ].join(', '),
      latitude: result.latLng?.lat,
      longitude: result.latLng?.lng,
      // 'country': null,
      city: result.adminArea5,
      stateCode: result.adminArea3,
      zipcode: result.postalCode,
      streetName: result.street,
      // 'streetNumber': null,
      countryCode: result.adminArea1
    };
  }
}

export default MapQuestGeocoder;
