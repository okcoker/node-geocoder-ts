import ResultError from 'src/utils/error/ResultError';
import BaseAbstractProviderAdapter from '../BaseAbstractProviderAdapter';
import type {
  HTTPAdapter,
  BaseAdapterOptions,
  GeocodeQuery,
  Result
} from 'src/types';

export interface Options extends BaseAdapterOptions {
  provider: 'freegeoip';
}

class FreegeoipProvider extends BaseAbstractProviderAdapter<Options> {
  // WS endpoint
  _endpoint = 'https://freegeoip.net/json/';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = {}
  ) {
    super(httpAdapter, { ...options, provider: 'freegeoip' });
    this.supportIPv4 = true;
    this.supportIPv6 = true;
    this.supportAddress = false;
  }

  override async _geocode(value: GeocodeQuery): Promise<Result> {
    const result = await this.httpAdapter.get(
      this._endpoint + value,
      {},
    );

    if (!result) {
      throw new ResultError(this);
    }
    const results = [];

    results.push({
      ip: result.ip,
      countryCode: result.country_code,
      country: result.country_name,
      regionCode: result.region_code,
      regionName: result.region_name,
      city: result.city,
      zipcode: result.zip_code,
      timeZone: result.time_zone,
      latitude: result.latitude,
      longitude: result.longitude,
      metroCode: result.metro_code
    });

    return {
      raw: result,
      data: results
    };
  }
}

export default FreegeoipProvider;
