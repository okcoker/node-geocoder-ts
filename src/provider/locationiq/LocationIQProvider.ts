import querystring from 'querystring';
import BaseAbstractProviderAdapter from '../BaseAbstractProviderAdapter';
import type {
  HTTPAdapter,
  BaseAdapterOptions,
  ReverseQuery,
  GeocodeQuery,
  ResultData,
  Result
} from 'src/types';
import ResultError from 'src/utils/error/ResultError';

export interface Options extends BaseAdapterOptions {
  provider: 'locationiq';
  apiKey: string;
}

class LocationIQProvider extends BaseAbstractProviderAdapter<Options> {
  _endpoint = 'http://us1.locationiq.com/v1';

  /**
   * Constructor
   *
   * Geocoder for LocationIQ
   * http://locationiq.org/#docs
   */
  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = { apiKey: '' }
  ) {
    super(httpAdapter, { ...options, provider: 'locationiq' });

    if (!options.apiKey) {
      throw new Error(`${this.constructor.name} needs an apiKey`);
    }

    this.options.apiKey = querystring.unescape(this.options.apiKey);
  }

  override async _geocode(value: GeocodeQuery): Promise<Result> {
    let params = this._getCommonParams();

    if (typeof value === 'string') {
      params.q = value;
    } else {
      for (const k in value) {
        const v = value[k];
        switch (k) {
          default:
            params[k] = v;
            break;
          // alias for postalcode
          case 'zipcode':
            params.postalcode = v;
            break;
          // alias for street
          case 'address':
            params.street = v;
            break;
        }
      }
    }
    params = this._forceParams(params);

    const result = await this.httpAdapter.get(
      this._endpoint + '/search',
      params
    );

    if (!result) {
      throw new ResultError(this);
    }

    // when there’s no err thrown here the resulting array object always
    // seemes to be defined but empty so no need to check for
    // responseData.error for now
    // add check if the array is not empty, as it returns an empty array from time to time
    const results = result.map(this._formatResult).filter((result: any) => {
      return result.longitude && result.latitude;
    });

    return {
      raw: result,
      data: results
    };
  }

  override async _reverse(
    query: ReverseQuery & { zoom?: number }
  ): Promise<Result> {
    let params = this._getCommonParams();
    const record = query as Record<string, any>;

    for (const k in record) {
      const v = record[k];
      params[k] = v;
    }
    params = this._forceParams(params);

    const result = await this.httpAdapter.get(
      this._endpoint + '/reverse',
      params
    );
    if (!result) {
      throw new ResultError(this);
    }

    // when there’s no err thrown here the resulting array object always
    // seemes to be defined but empty so no need to check for
    // responseData.error for now

    // locationiq always seemes to answer with a single object instead
    // of an array
    const results = [result].map(this._formatResult).filter((result: any) => {
      return result.longitude && result.latitude;
    });

    return {
      raw: result,
      data: results
    };
  }

  private _formatResult(result: any): ResultData {
    // transform lat and lon to real floats
    const transformedResult = {
      latitude: result.lat ? parseFloat(result.lat) : undefined,
      longitude: result.lon ? parseFloat(result.lon) : undefined
    };

    if (result.address) {
      // @ts-expect-error TS(2339): Property 'country' does not exist on type '{ latit... Remove this comment to see the full error message
      transformedResult.country = result.address.country;
      // @ts-expect-error TS(2339): Property 'country' does not exist on type '{ latit... Remove this comment to see the full error message
      transformedResult.country = result.address.country;
      // @ts-expect-error TS(2339): Property 'city' does not exist on type '{ latitude... Remove this comment to see the full error message
      transformedResult.city =
        result.address.city ||
        result.address.town ||
        result.address.village ||
        result.address.hamlet;
      // @ts-expect-error TS(2339): Property 'state' does not exist on type '{ latitud... Remove this comment to see the full error message
      transformedResult.state = result.address.state;
      // @ts-expect-error TS(2339): Property 'zipcode' does not exist on type '{ latit... Remove this comment to see the full error message
      transformedResult.zipcode = result.address.postcode;
      // @ts-expect-error TS(2339): Property 'streetName' does not exist on type '{ la... Remove this comment to see the full error message
      transformedResult.streetName =
        result.address.road || result.address.cycleway;
      // @ts-expect-error TS(2339): Property 'streetNumber' does not exist on type '{ ... Remove this comment to see the full error message
      transformedResult.streetNumber = result.address.house_number;

      // make sure countrycode is always uppercase to keep node-geocoder api formats
      let countryCode = result.address.country_code;
      if (countryCode) {
        countryCode = countryCode.toUpperCase();
      }

      // @ts-expect-error TS(2339): Property 'countryCode' does not exist on type '{ l... Remove this comment to see the full error message
      transformedResult.countryCode = countryCode;
    }
    return transformedResult;
  }

  /**
   * Prepare common params
   *
   * @return <Object> common params
   */
  private _getCommonParams(): Record<string, any> {
    return {
      key: this.options.apiKey
    };
  }

  /**
   * Adds parameters that are enforced
   *
   * @param  {object} params object containing the parameters
   */
  private _forceParams(params: any): Record<string, any> {
    return {
      ...params,
      format: 'json',
      addressdetails: '1'
    };
  }
}

export default LocationIQProvider;
