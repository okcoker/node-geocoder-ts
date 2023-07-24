import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,
  BaseAdapterOptions,
  ReverseQuery,
  GeocodeQuery,
  ResultData,
  Result
} from '../../types';

export interface Options extends BaseAdapterOptions {
  provider: 'opencage';
  apiKey: string;
  language?: string;
}

// http://geocoder.opencagedata.com/api.html#confidence
const ConfidenceInKM = {
  10: 0.25,
  9: 0.5,
  8: 1,
  7: 5,
  6: 7.5,
  5: 10,
  4: 15,
  3: 20,
  2: 25,
  1: Number.POSITIVE_INFINITY,
  0: Number.NaN
};

class OpenCageGeocoder extends BaseAbstractGeocoderAdapter<Options> {
  _endpoint = 'http://api.opencagedata.com/geocode/v1/json';
  // In case we need to support v1/v2 and this changes
  _ConfidenceInKM = ConfidenceInKM;

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = { apiKey: '' }
  ) {
    super(httpAdapter, { ...options, provider: 'opencage' });

    if (!options.apiKey) {
      throw new Error(this.constructor.name + ' needs an apiKey');
    }
  }

  /**
   *
   * @param query Value to geocode (Address)
   */
  override async _geocode(query: GeocodeQuery): Promise<Result> {
    const params = this._getCommonParams();
    if (typeof query === 'string') {
      params.q = query;
    } else {
      if (query.bounds) {
        if (Array.isArray(query.bounds)) {
          params.bounds = query.bounds.join(',');
        } else {
          params.bounds = query.bounds;
        }
      }
      if (query.countryCode) {
        params.countrycode = query.countryCode;
      }
      if (query.limit) {
        params.limit = query.limit;
      }
      if (query.minConfidence) {
        params.min_confidence = query.minConfidence;
      }
      if (query.language) {
        params.language = query.language;
      }
      params.q = query.address;
    }

    const result = await this.httpAdapter.get(this._endpoint, params)
    const results: ResultData[] = [];

    if (result && result.results instanceof Array) {
      result.results.forEach((data: any) => {
        results.push(this._formatResult(data));
      });
    }

    return {
      data: results,
      raw: result
    };
  }

  override async _reverse(query: ReverseQuery): Promise<Result> {
    const lat = query.lat;
    const lng = query.lon;
    const params = this._getCommonParams();
    params.q = lat + ' ' + lng;

    const result = await this.httpAdapter.get(this._endpoint, params)

    const results: ResultData[] = [];

    if (result && Array.isArray(result.results)) {
      result.results.forEach((data: any) => {
        results.push(this._formatResult(data));
      });
    }

    return {
      raw: result,
      data: results
    };
  }

  private _formatResult(result: any) {
    const confidence = result.confidence || 0;

    return {
      latitude: result.geometry.lat,
      longitude: result.geometry.lng,
      country: result.components.country,
      city: result.components.city,
      state: result.components.state,
      zipcode: result.components.postcode,
      streetName: result.components.road,
      streetNumber: result.components.house_number,
      countryCode: result.components.country_code,
      county: result.components.county,
      extra: {
        confidence: confidence,
        confidenceKM:
          ConfidenceInKM[result.confidence as keyof typeof ConfidenceInKM] ||
          Number.NaN
      }
    };
  }


  /**
   * Prepare common params
   *
   * @return <Object> common params
   */
  private _getCommonParams(): Record<string, any> {
    const params: Record<string, any> = {};
    params.key = this.options.apiKey;

    if (this.options.language) {
      params.language = this.options.language;
    }

    return params;
  }
}

export default OpenCageGeocoder;
