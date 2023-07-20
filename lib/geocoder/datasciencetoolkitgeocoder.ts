import net from 'net';
import BaseAbstractGeocoder from './abstractgeocoder';
import type { HTTPAdapter, ResultCallback, BaseOptions } from '../../types';

export interface Options extends BaseOptions {
  provider: 'datasciencetoolkit';
  host?: string;
}

/**
 * Constructor
 */
class DataScienceToolkitGeocoder extends BaseAbstractGeocoder<Options> {
  constructor(httpAdapter: HTTPAdapter, options: Options) {
    super(httpAdapter, options);

    this.supportIPv4 = true;
  }

  /**
   * Build DSTK endpoint, allows for local DSTK installs
   * @param <string>   value    Value to geocode (Address or IPv4)
   */
  _endpoint(value: any) {
    const ep = {};
    let host = 'www.datasciencetoolkit.org';

    if (this.options.host) {
      host = this.options.host;
    }

    // @ts-expect-error TS(2339): Property 'ipv4Endpoint' does not exist on type '{}... Remove this comment to see the full error message
    ep.ipv4Endpoint = 'http://' + host + '/ip2coordinates/';
    // @ts-expect-error TS(2339): Property 'street2coordinatesEndpoint' does not exi... Remove this comment to see the full error message
    ep.street2coordinatesEndpoint = 'http://' + host + '/street2coordinates/';

    // @ts-expect-error TS(2339): Property 'ipv4Endpoint' does not exist on type '{}... Remove this comment to see the full error message
    return net.isIPv4(value) ? ep.ipv4Endpoint : ep.street2coordinatesEndpoint;
  }

  /**
   * Geocode
   * @param <string>   value    Value to geocode (Address or IPv4)
   * @param <function> callback Callback method
   */
  _geocode(value: any, callback: ResultCallback) {
    const ep = this._endpoint(value);
    this.httpAdapter.get(ep + value, {}, (err: any, result: any) => {
      if (err) {
        return callback(err, null);
      } else {
        result = result[value];
        if (!result) {
          return callback(
            new Error('Could not geocode "' + value + '".'),
            null
          );
        }

        callback(null, {
          raw: result,
          data: [
            {
              latitude: result.latitude,
              longitude: result.longitude,
              country: result.country_name,
              city: result.city || result.locality,
              state: result.state || result.region,
              zipcode: result.postal_code,
              streetName: result.street_name,
              streetNumber: result.street_number,
              countryCode: result.country_code
            }
          ]
        });
      }
    });
  }
}

export default DataScienceToolkitGeocoder;
