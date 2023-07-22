import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  BaseAdapterOptions,
  Location,
  GeocodeValue,
  ResultData
} from '../../types';

export interface Options extends BaseAdapterOptions {
  provider: 'virtualearth';
  apiKey: string;
}

class VirtualEarthGeocoder extends BaseAbstractGeocoderAdapter<Options> {
  _endpoint = 'https://dev.virtualearth.net/REST/v1/Locations';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = { apiKey: '' }
  ) {
    super(httpAdapter, { ...options, provider: 'virtualearth' });

    if (!options.apiKey) {
      throw new Error('You must specify an apiKey');
    }
  }

  override _geocode(value: GeocodeValue, callback: ResultCallback) {
    const params = {
      q: value,
      key: this.options.apiKey
    };

    this.httpAdapter.get(this._endpoint, params, (err: any, result: any) => {
      if (err) {
        return callback(err, null);
      } else {
        const results = result.resourceSets[0].resources.map((data: any) => {
          return this._formatResult(data);
        });

        callback(null, {
          data: results,
          raw: result
        });
      }
    });
  }

  override _reverse(value: Location, callback: ResultCallback) {
    const params = {
      key: this.options.apiKey
    };
    const endpoint = this._endpoint + '/' + value.lat + ',' + value.lon;

    this.httpAdapter.get(endpoint, params, (err: any, result: any) => {
      if (err) {
        return callback(err, null);
      } else {
        const results = result.resourceSets[0].resources.map((data: any) => {
          return this._formatResult(data);
        });

        callback(null, {
          data: results,
          raw: result
        });
      }
    });
  }

  _formatResult(result: any): ResultData {
    return {
      latitude: result.point.coordinates[0],
      longitude: result.point.coordinates[1],
      country: result.address.countryRegion,
      city: result.address.locality,
      state: result.address.adminDistrict,
      zipcode: result.address.postalCode,
      streetName: result.address.addressLine,
      formattedAddress: result.address.formattedAddress
    };
  }
}

export default VirtualEarthGeocoder;
