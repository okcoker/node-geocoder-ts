import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  BaseAdapterOptions,
  GeocodeValue,
  ResultData
} from '../../types';

export interface Options extends BaseAdapterOptions {
  provider: 'smartystreets';
  auth_id: string;
  auth_token: string;
}

class SmartyStreets extends BaseAbstractGeocoderAdapter<Options> {
  _endpoint = 'https://api.smartystreets.com/street-address';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = { auth_id: '', auth_token: '' }
  ) {
    super(httpAdapter, { ...options, provider: 'smartystreets' });

    if (!options.auth_id && !options.auth_token) {
      throw new Error('You must specify an auth-id and auth-token!');
    }
  }

  /**
   * Format Result
   **/
  _formatResult(result: any): ResultData | null {
    if (!result) {
      return null;
    }
    return {
      latitude: result.metadata.latitude,
      longitude: result.metadata.longitude,
      // 'country': null,
      city: result.components.city_name,
      zipcode: result.components.zipcode,
      streetName:
        result.components.street_name + ' ' + result.components.street_suffix,
      streetNumber: result.components.primary_number,
      // 'countryCode': null,
      // @ts-expect-error This doesnt seem to follow the other geocoders. check later
      type: result.metadata.record_type,
      dpv_match: result.analysis.dpv_match_code,
      dpv_footnotes: result.analysis.dpv_footnotes
    };
  }

  override _geocode(value: GeocodeValue, callback: ResultCallback) {
    const params = {
      street: value,
      'auth-id': this.options.auth_id,
      'auth-token': this.options.auth_token,
      format: 'json'
    };

    this.httpAdapter.get(this._endpoint, params, (err: any, result: any) => {
      if (err) {
        return callback(err, null);
      } else {
        const results: ResultData[] = result
          .map((data: any) => {
            return this._formatResult(data);
          })
          .filter(Boolean);

        callback(null, {
          data: results,
          raw: result
        });
      }
    });
  }
}

export default SmartyStreets;
