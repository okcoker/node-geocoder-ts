import querystring from 'querystring';
import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  BaseAdapterOptions,
  ReverseQuery,
  GeocodeQuery,
  ResultData
} from 'types';

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

  override _geocode(value: GeocodeQuery, callback: ResultCallback) {
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

    this.httpAdapter.get(
      this._endpoint + '/address',
      params,
      (err: any, result: any) => {
        if (err || !result) {
          return callback(err, null);
        }

        if (result.info.statuscode !== 0) {
          return callback(
            new Error(
              'Status is ' +
              result.info.statuscode +
              ' ' +
              result.info.messages[0]
            ),
            null
          );
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

        callback(null, {
          raw: result,
          data: results
        });
      }
    );
  }

  _formatResult(result: any): ResultData {
    return {
      formattedAddress: [
        result.street,
        result.adminArea5,
        (result.adminArea3 + ' ' + result.postalCode).trim(),
        result.adminArea1
      ].join(', '),
      latitude: result.latLng.lat,
      longitude: result.latLng.lng,
      // 'country': null,
      city: result.adminArea5,
      stateCode: result.adminArea3,
      zipcode: result.postalCode,
      streetName: result.street,
      // 'streetNumber': null,
      countryCode: result.adminArea1
    };
  }

  override _reverse(query: ReverseQuery, callback: ResultCallback) {
    const lat = query.lat;
    const lng = query.lon;

    this.httpAdapter.get(
      this._endpoint + '/reverse',
      {
        location: lat + ',' + lng,
        key: querystring.unescape(this.options.apiKey)
      },
      (err: any, result: any) => {
        if (err || !result) {
          return callback(err, null);
        }

        const locations = result.results[0].locations;
        const results = locations.map(this._formatResult);

        callback(null, {
          raw: result,
          data: results
        });
      }
    );
  }
}

export default MapQuestGeocoder;
