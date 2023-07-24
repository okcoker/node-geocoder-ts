import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  BaseAdapterOptions,
  GeocodeQuery
} from 'types';

export interface Options extends BaseAdapterOptions {
  provider: 'freegeoip';
}

class FreegeoipGeocoder extends BaseAbstractGeocoderAdapter<Options> {
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

  override _geocode(value: GeocodeQuery, callback: ResultCallback) {
    this.httpAdapter.get(
      this._endpoint + value,
      {},
      (err: any, result: any) => {
        if (err || !result) {
          return callback(err, null);
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

        callback(null, {
          raw: result,
          data: results
        });
      }
    );
  }
}

export default FreegeoipGeocoder;
