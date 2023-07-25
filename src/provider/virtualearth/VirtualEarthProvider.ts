import BaseAbstractProviderAdapter from '../BaseAbstractProviderAdapter';
import type {
  HTTPAdapter,
  BaseAdapterOptions,
  ReverseQuery,
  GeocodeQuery,
  ResultData,
  Result
} from 'src/types';

export interface Options extends BaseAdapterOptions {
  provider: 'virtualearth';
  apiKey: string;
}

class VirtualEarthProvider extends BaseAbstractProviderAdapter<Options> {
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

  override async _geocode(query: GeocodeQuery): Promise<Result> {
    const params = {
      q: query,
      key: this.options.apiKey
    };

    const result = await this.httpAdapter.get(this._endpoint, params)

    const results = result.resourceSets[0].resources.map((data: any) => {
      return this._formatResult(data);
    });

    return {
      data: results,
      raw: result
    };
  }

  override async _reverse(query: ReverseQuery): Promise<Result> {
    const params = {
      key: this.options.apiKey
    };
    const endpoint = this._endpoint + '/' + query.lat + ',' + query.lon;

    const result = await this.httpAdapter.get(endpoint, params);

    const results = result.resourceSets[0].resources.map((data: any) => {
      return this._formatResult(data);
    });

    return {
      data: results,
      raw: result
    };
  }

  private _formatResult(result: any): ResultData {
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

export default VirtualEarthProvider;
