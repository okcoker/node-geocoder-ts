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

class OpenMapQuestGeocoder extends BaseAbstractGeocoder<Options> {
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

  _geocode(value: GeocodeValue, callback: ResultCallback) {
    this.httpAdapter.get(
      this._endpoint + '/address',
      {
        location: value,
        key: querystring.unescape(this.options.apiKey)
      },
      (err: any, result: any) => {
        if (err) {
          return callback(err, null);
        } else {
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

          const results = result.results[0].locations.map((data: any) => {
            return this._formatResult(data);
          });

          callback(null, {
            data: results,
            raw: result
          });
        }
      }
    );
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

  _reverse(query: Location, callback: ResultCallback) {
    const lat = query.lat;
    const lng = query.lon;

    this.httpAdapter.get(
      this._endpoint + '/reverse',
      {
        location: lat + ',' + lng,
        key: querystring.unescape(this.options.apiKey)
      },
      (err: any, result: any) => {
        if (err) {
          return callback(err, null);
        } else {
          if (result.results === undefined || !result.results.length) {
            return callback(new Error('Incorrect response'), null);
          }

          const results = result.results[0].locations.map((data: any) => {
            return this._formatResult(data);
          });
          callback(null, {
            data: results,
            raw: result
          });
        }
      }
    );
  }
}

export default OpenMapQuestGeocoder;
