import BaseAbstractGeocoder from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  BaseOptions,
  GeocodeValue
} from '../../types';

export interface Options extends BaseOptions {
  provider: 'freegeoip';
}

class FreegeoipGeocoder extends BaseAbstractGeocoder<Options> {
  // WS endpoint
  _endpoint = 'https://freegeoip.net/json/';

  constructor(httpAdapter: HTTPAdapter, options: Omit<Options, 'provider'>) {
    super(httpAdapter, { ...options, provider: 'freegeoip' });
    this.supportIPv4 = true;
    this.supportIPv6 = true;
    this.supportAddress = false;
  }

  _geocode(value: GeocodeValue, callback: ResultCallback) {
    this.httpAdapter.get(
      this._endpoint + value,
      {},
      (err: any, result: any) => {
        if (err) {
          return callback(err, null);
        } else {
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
      }
    );
  }
}

export default FreegeoipGeocoder;
