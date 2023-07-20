import crypto from 'crypto';
import url from 'url';
import BaseAbstractGeocoder from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  BaseOptions,
  ResultData,
  Location
} from '../../types';

export interface Options extends BaseOptions {
  provider: 'google';
  clientId?: string;
  apiKey?: string;
  language?: string;
  region?: string;
  excludePartialMatches?: boolean;
  channel?: string;
}

class GoogleGeocoder extends BaseAbstractGeocoder<Options> {
  // Google geocoding API endpoint
  _endpoint = 'https://maps.googleapis.com/maps/api/geocode/json';

  constructor(httpAdapter: HTTPAdapter, options: Options) {
    super(httpAdapter, options);

    if (this.options.clientId && !this.options.apiKey) {
      throw new Error('You must specify a apiKey (privateKey)');
    }

    if (this.options.apiKey && !httpAdapter.supportsHttps()) {
      throw new Error('You must use https http adapter');
    }
  }

  _geocode(value: any, callback: ResultCallback) {
    const params = this._prepareQueryString();

    if (value.address) {
      let components = '';

      if (value.country) {
        components = 'country:' + value.country;
      }

      if (value.zipcode) {
        if (components) {
          components += '|';
        }
        components += 'postal_code:' + value.zipcode;
      }

      params.components = this._encodeSpecialChars(components);
      params.address = this._encodeSpecialChars(value.address);
    } else if (value.googlePlaceId) {
      params.place_id = value.googlePlaceId;
    } else {
      params.address = this._encodeSpecialChars(value);
    }

    if (value.language) {
      params.language = value.language;
    }

    if (value.region) {
      params.region = value.region;
    }

    const excludePartialMatches = params.excludePartialMatches;
    delete params.excludePartialMatches;

    this._signedRequest(this._endpoint, params);
    this.httpAdapter.get(this._endpoint, params, (err: any, result: any) => {
      if (err) {
        return callback(err, null);
      } else {
        // status can be "OK", "ZERO_RESULTS", "OVER_QUERY_LIMIT", "REQUEST_DENIED", "INVALID_REQUEST", or "UNKNOWN_ERROR"
        // error_message may or may not be present
        if (result.status === 'ZERO_RESULTS') {
          return callback(null, {
            raw: result,
            data: []
          });
        }

        if (result.status !== 'OK') {
          return callback(
            new Error(
              'Status is ' +
                result.status +
                '.' +
                (result.error_message ? ' ' + result.error_message : '')
            ),
            null
          );
        }

        const results = result.results
          .map((currentResult: any) => {
            if (
              excludePartialMatches &&
              excludePartialMatches === true &&
              typeof currentResult.partial_match !== 'undefined' &&
              currentResult.partial_match === true
            ) {
              return null;
            }

            return this._formatResult(currentResult);
          })
          .filter(Boolean);

        callback(null, {
          data: results,
          raw: result
        });
      }
    });
  }

  _prepareQueryString(): Record<string, any> {
    const params: Record<string, any> = {
      sensor: false
    };

    if (this.options.language) {
      params.language = this.options.language;
    }

    if (this.options.region) {
      params.region = this.options.region;
    }

    if (this.options.clientId) {
      params.client = this.options.clientId;
    } else if (this.options.apiKey) {
      params.key = this.options.apiKey;
    }

    if (this.options.channel) {
      params.channel = this.options.channel;
    }

    if (
      this.options.excludePartialMatches &&
      this.options.excludePartialMatches === true
    ) {
      params.excludePartialMatches = true;
    }

    return params;
  }

  _signedRequest(endpoint: string, params: Record<string, any>) {
    if (this.options.clientId) {
      const request = url.parse(endpoint);
      const fullRequestPath = request.path + url.format({ query: params });

      const decodedKey = Buffer.from(
        this.options.apiKey?.replace('-', '+').replace('_', '/') || '',
        'base64'
      );
      const hmac = crypto.createHmac('sha1', decodedKey);
      hmac.update(fullRequestPath);
      let signature = hmac.digest('base64');

      signature = signature.replace(/\+/g, '-').replace(/\//g, '_');

      params.signature = signature;
    }

    return params;
  }

  _formatResult(result: any): ResultData {
    const googleConfidenceLookup = {
      ROOFTOP: 1,
      RANGE_INTERPOLATED: 0.9,
      GEOMETRIC_CENTER: 0.7,
      APPROXIMATE: 0.5
    };

    const extractedObj = {
      formattedAddress: result.formatted_address || null,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      extra: {
        googlePlaceId: result.place_id || null,
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        confidence: googleConfidenceLookup[result.geometry.location_type] || 0,
        premise: null,
        subpremise: null,
        neighborhood: null,
        establishment: null
      },
      administrativeLevels: {}
    };

    for (let i = 0; i < result.address_components.length; i++) {
      for (let x = 0; x < result.address_components[i].types.length; x++) {
        const addressType = result.address_components[i].types[x];
        switch (addressType) {
          //Country
          case 'country':
            // @ts-expect-error TS(2339): Property 'country' does not exist on type '{ forma... Remove this comment to see the full error message
            extractedObj.country = result.address_components[i].long_name;
            // @ts-expect-error TS(2339): Property 'countryCode' does not exist on type '{ f... Remove this comment to see the full error message
            extractedObj.countryCode = result.address_components[i].short_name;
            break;
          //Administrative Level 1
          case 'administrative_area_level_1':
            // @ts-expect-error TS(2339): Property 'level1long' does not exist on type '{}'.
            extractedObj.administrativeLevels.level1long =
              result.address_components[i].long_name;
            // @ts-expect-error TS(2339): Property 'level1short' does not exist on type '{}'... Remove this comment to see the full error message
            extractedObj.administrativeLevels.level1short =
              result.address_components[i].short_name;
            break;
          //Administrative Level 2
          case 'administrative_area_level_2':
            // @ts-expect-error TS(2339): Property 'level2long' does not exist on type '{}'.
            extractedObj.administrativeLevels.level2long =
              result.address_components[i].long_name;
            // @ts-expect-error TS(2339): Property 'level2short' does not exist on type '{}'... Remove this comment to see the full error message
            extractedObj.administrativeLevels.level2short =
              result.address_components[i].short_name;
            break;
          //Administrative Level 3
          case 'administrative_area_level_3':
            // @ts-expect-error TS(2339): Property 'level3long' does not exist on type '{}'.
            extractedObj.administrativeLevels.level3long =
              result.address_components[i].long_name;
            // @ts-expect-error TS(2339): Property 'level3short' does not exist on type '{}'... Remove this comment to see the full error message
            extractedObj.administrativeLevels.level3short =
              result.address_components[i].short_name;
            break;
          //Administrative Level 4
          case 'administrative_area_level_4':
            // @ts-expect-error TS(2339): Property 'level4long' does not exist on type '{}'.
            extractedObj.administrativeLevels.level4long =
              result.address_components[i].long_name;
            // @ts-expect-error TS(2339): Property 'level4short' does not exist on type '{}'... Remove this comment to see the full error message
            extractedObj.administrativeLevels.level4short =
              result.address_components[i].short_name;
            break;
          //Administrative Level 5
          case 'administrative_area_level_5':
            // @ts-expect-error TS(2339): Property 'level5long' does not exist on type '{}'.
            extractedObj.administrativeLevels.level5long =
              result.address_components[i].long_name;
            // @ts-expect-error TS(2339): Property 'level5short' does not exist on type '{}'... Remove this comment to see the full error message
            extractedObj.administrativeLevels.level5short =
              result.address_components[i].short_name;
            break;
          // City
          case 'locality':
          case 'postal_town':
            // @ts-expect-error TS(2339): Property 'city' does not exist on type '{ formatte... Remove this comment to see the full error message
            extractedObj.city = result.address_components[i].long_name;
            break;
          // Address
          case 'postal_code':
            // @ts-expect-error TS(2339): Property 'zipcode' does not exist on type '{ forma... Remove this comment to see the full error message
            extractedObj.zipcode = result.address_components[i].long_name;
            break;
          case 'route':
            // @ts-expect-error TS(2339): Property 'streetName' does not exist on type '{ fo... Remove this comment to see the full error message
            extractedObj.streetName = result.address_components[i].long_name;
            break;
          case 'street_number':
            // @ts-expect-error TS(2339): Property 'streetNumber' does not exist on type '{ ... Remove this comment to see the full error message
            extractedObj.streetNumber = result.address_components[i].long_name;
            break;
          case 'premise':
            extractedObj.extra.premise = result.address_components[i].long_name;
            break;
          case 'subpremise':
            extractedObj.extra.subpremise =
              result.address_components[i].long_name;
            break;
          case 'establishment':
            extractedObj.extra.establishment =
              result.address_components[i].long_name;
            break;
          case 'sublocality_level_1':
          case 'political':
          case 'sublocality':
          case 'neighborhood':
            if (!extractedObj.extra.neighborhood) {
              extractedObj.extra.neighborhood =
                result.address_components[i].long_name;
            }
            break;
        }
      }
    }
    return extractedObj;
  }

  _reverse(
    query: Location & {
      language?: string;
      result_type?: string;
      location_type?: string;
    },
    callback: ResultCallback
  ) {
    const lat = query.lat;
    const lng = query.lon;
    const params = this._prepareQueryString();

    params.latlng = lat + ',' + lng;

    if (query.language) {
      params.language = query.language;
    }

    if (query.result_type) {
      params.result_type = query.result_type;
    }

    if (query.location_type) {
      params.location_type = query.location_type;
    }

    this._signedRequest(this._endpoint, params);
    this.httpAdapter.get(this._endpoint, params, (err: any, result: any) => {
      if (err) {
        return callback(err, null);
      } else {
        // status can be "OK", "ZERO_RESULTS", "OVER_QUERY_LIMIT", "REQUEST_DENIED", "INVALID_REQUEST", or "UNKNOWN_ERROR"
        // error_message may or may not be present
        if (result.status !== 'OK') {
          return callback(
            new Error(
              'Status is ' +
                result.status +
                '.' +
                (result.error_message ? ' ' + result.error_message : '')
            ),
            null
          );
        }

        const results = result.results.map((data: any) => {
          return this._formatResult(data);
        });

        callback(null, {
          raw: result,
          data: results
        });
      }
    });
  }

  _encodeSpecialChars = function (value: any) {
    if (typeof value === 'string') {
      // eslint-disable-next-line no-control-regex
      return value.replace(/\u001a/g, ' ');
    }

    return value;
  };
}

export default GoogleGeocoder;
