import net from 'net';
import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  BaseAdapterOptions
} from 'types';

export interface Options extends BaseAdapterOptions {
  provider: 'datasciencetoolkit';
  host?: string;
}

/**
 * Constructor
 */
class DataScienceToolkitGeocoder extends BaseAbstractGeocoderAdapter<Options> {
  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = {}
  ) {
    super(httpAdapter, { ...options, provider: 'datasciencetoolkit' });

    this.supportIPv4 = true;
  }

  /**
   * Build DSTK endpoint, allows for local DSTK installs
   * @param query Value to geocode (Address or IPv4)
   */
  _endpoint(query: string) {
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
    return net.isIPv4(query) ? ep.ipv4Endpoint : ep.street2coordinatesEndpoint;
  }

  /**
   * Geocode
   * @param query Value to geocode (Address or IPv4)
   * @param callback callback method
   */
  override _geocode(query: string, callback: ResultCallback) {
    const ep = this._endpoint(query);

    this.httpAdapter.get(ep + query, {}, (err: any, result: any) => {
      if (err || !result) {
        return callback(err, null);
      }

      result = result[query];
      if (!result) {
        return callback(
          new Error('Could not geocode "' + query + '".'),
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
    });
  }
}

export default DataScienceToolkitGeocoder;
