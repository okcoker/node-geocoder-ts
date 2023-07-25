import net from 'net';
import BaseAbstractProviderAdapter from '../BaseAbstractProviderAdapter';
import type { HTTPAdapter, BaseAdapterOptions, Result } from 'src/types';
import ResultError from 'src/utils/error/ResultError';

export interface Options extends BaseAdapterOptions {
  provider: 'datasciencetoolkit';
  host?: string;
}

/**
 * Constructor
 */
class DataScienceToolkitProvider extends BaseAbstractProviderAdapter<Options> {
  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = {}
  ) {
    super(httpAdapter, { ...options, provider: 'datasciencetoolkit' });

    this.supportIPv4 = true;
  }

  override async _geocode(query: string): Promise<Result> {
    const ep = this._endpoint(query);

    const result = await this.httpAdapter.get(ep + query, {});

    if (!result) {
      throw new ResultError(this);
    }

    const json = result[query];
    if (!json) {
      throw new Error('Could not geocode "' + query + '".');
    }

    return {
      raw: result,
      data: [
        {
          latitude: json.latitude,
          longitude: json.longitude,
          country: json.country_name,
          city: json.city || json.locality,
          state: json.state || json.region,
          zipcode: json.postal_code,
          streetName: json.street_name,
          streetNumber: json.street_number,
          countryCode: json.country_code
        }
      ]
    };
  }

  /**
   * Build DSTK endpoint, allows for local DSTK installs
   * @param query Value to geocode (Address or IPv4)
   */
  private _endpoint(query: string) {
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
}

export default DataScienceToolkitProvider;
