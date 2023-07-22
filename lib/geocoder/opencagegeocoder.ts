import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  BaseAdapterOptions,
  Location,
  GeocodeValue,
  ResultData
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
   * Geocode
   * @param <string>   value    Value to geocode (Address)
   * @param <function> callback Callback method
   */
  override _geocode(value: GeocodeValue, callback: ResultCallback) {
    const params = this._getCommonParams();
    if (typeof value === 'string') {
      params.q = value;
    } else {
      if (value.bounds) {
        if (Array.isArray(value.bounds)) {
          params.bounds = value.bounds.join(',');
        } else {
          params.bounds = value.bounds;
        }
      }
      if (value.countryCode) {
        params.countrycode = value.countryCode;
      }
      if (value.limit) {
        params.limit = value.limit;
      }
      if (value.minConfidence) {
        params.min_confidence = value.minConfidence;
      }
      if (value.language) {
        params.language = value.language;
      }
      params.q = value.address;
    }

    this.httpAdapter.get(this._endpoint, params, (err: any, result: any) => {
      if (err) {
        return callback(err, null);
      } else {
        const results: ResultData[] = [];

        if (result && result.results instanceof Array) {
          result.results.forEach((data: any) => {
            results.push(this._formatResult(data));
          });
        }

        callback(null, {
          data: results,
          raw: result
        });
      }
    });
  }

  _formatResult(result: any) {
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

  override _reverse(query: Location, callback: ResultCallback) {
    const lat = query.lat;
    const lng = query.lon;
    const params = this._getCommonParams();
    params.q = lat + ' ' + lng;

    this.httpAdapter.get(this._endpoint, params, (err: any, result: any) => {
      if (err) {
        callback(err, null);
      } else {
        const results: ResultData[] = [];

        if (result && Array.isArray(result.results)) {
          result.results.forEach((data: any) => {
            results.push(this._formatResult(data));
          });
        }

        callback(null, {
          raw: result,
          data: results
        });
      }
    });
  }

  /**
   * Prepare common params
   *
   * @return <Object> common params
   */
  _getCommonParams(): Record<string, any> {
    const params: Record<string, any> = {};
    params.key = this.options.apiKey;

    if (this.options.language) {
      params.language = this.options.language;
    }

    return params;
  }
}

export default OpenCageGeocoder;
