
var crypto = require('crypto');
var url = require('url');
var util = require('util');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'AbstractGe... Remove this comment to see the full error message
var AbstractGeocoder = require('./abstractgeocoder');

/**
 * Constructor
 * @param <object> httpAdapter Http Adapter
 * @param <object> options     Options (language, clientId, apiKey, region, excludePartialMatches)
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleGeoc... Remove this comment to see the full error message
var GoogleGeocoder = function GoogleGeocoder(this: any, httpAdapter: any, options: any) {
  this.options = [
    'language',
    'apiKey',
    'clientId',
    'region',
    'excludePartialMatches',
    'channel'
  ];

  // @ts-expect-error TS(2339): Property 'super_' does not exist on type '(this: a... Remove this comment to see the full error message
  GoogleGeocoder.super_.call(this, httpAdapter, options);

  if (this.options.clientId && !this.options.apiKey) {
    throw new Error('You must specify a apiKey (privateKey)');
  }

  if (this.options.apiKey && !httpAdapter.supportsHttps()) {
    throw new Error('You must use https http adapter');
  }
};

util.inherits(GoogleGeocoder, AbstractGeocoder);

// Google geocoding API endpoint
GoogleGeocoder.prototype._endpoint =
  'https://maps.googleapis.com/maps/api/geocode/json';

/**
 * Geocode
 * @param <string>   value    Value ton geocode (Address)
 * @param <function> callback Callback method
 */
GoogleGeocoder.prototype._geocode = function (value: any, callback: any) {
  var _this = this;
  var params = this._prepareQueryString();

  if (value.address) {
    var components = '';

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

  var excludePartialMatches = params.excludePartialMatches;
  delete params.excludePartialMatches;

  this._signedRequest(this._endpoint, params);
  this.httpAdapter.get(this._endpoint, params, function (err: any, result: any) {
    if (err) {
      return callback(err);
    } else {
      var results: any = [];
      // status can be "OK", "ZERO_RESULTS", "OVER_QUERY_LIMIT", "REQUEST_DENIED", "INVALID_REQUEST", or "UNKNOWN_ERROR"
      // error_message may or may not be present
      if (result.status === 'ZERO_RESULTS') {
        results.raw = result;
        return callback(false, results);
      }

      if (result.status !== 'OK') {
        return callback(
          new Error(
            'Status is ' +
              result.status +
              '.' +
              (result.error_message ? ' ' + result.error_message : '')
          ),
          { raw: result }
        );
      }

      for (var i = 0; i < result.results.length; i++) {
        var currentResult = result.results[i];

        if (
          excludePartialMatches &&
          excludePartialMatches === true &&
          typeof currentResult.partial_match !== 'undefined' &&
          currentResult.partial_match === true
        ) {
          continue;
        }

        results.push(_this._formatResult(currentResult));
      }

      results.raw = result;
      callback(false, results);
    }
  });
};

GoogleGeocoder.prototype._prepareQueryString = function () {
  var params = {
    sensor: false
  };

  if (this.options.language) {
    // @ts-expect-error TS(2339): Property 'language' does not exist on type '{ sens... Remove this comment to see the full error message
    params.language = this.options.language;
  }

  if (this.options.region) {
    // @ts-expect-error TS(2339): Property 'region' does not exist on type '{ sensor... Remove this comment to see the full error message
    params.region = this.options.region;
  }

  if (this.options.clientId) {
    // @ts-expect-error TS(2339): Property 'client' does not exist on type '{ sensor... Remove this comment to see the full error message
    params.client = this.options.clientId;
  } else if (this.options.apiKey) {
    // @ts-expect-error TS(2339): Property 'key' does not exist on type '{ sensor: b... Remove this comment to see the full error message
    params.key = this.options.apiKey;
  }

  if (this.options.channel) {
    // @ts-expect-error TS(2339): Property 'channel' does not exist on type '{ senso... Remove this comment to see the full error message
    params.channel = this.options.channel;
  }

  if (
    this.options.excludePartialMatches &&
    this.options.excludePartialMatches === true
  ) {
    // @ts-expect-error TS(2339): Property 'excludePartialMatches' does not exist on... Remove this comment to see the full error message
    params.excludePartialMatches = true;
  }

  return params;
};

GoogleGeocoder.prototype._signedRequest = function (endpoint: any, params: any) {
  if (this.options.clientId) {
    var request = url.parse(endpoint);
    var fullRequestPath = request.path + url.format({ query: params });

    var decodedKey = Buffer.from(
      this.options.apiKey.replace('-', '+').replace('_', '/'),
      'base64'
    );
    // @ts-expect-error TS(2339): Property 'createHmac' does not exist on type 'Cryp... Remove this comment to see the full error message
    var hmac = crypto.createHmac('sha1', decodedKey);
    hmac.update(fullRequestPath);
    var signature = hmac.digest('base64');

    signature = signature.replace(/\+/g, '-').replace(/\//g, '_');

    params.signature = signature;
  }

  return params;
};

GoogleGeocoder.prototype._formatResult = function (result: any) {
  var googleConfidenceLookup = {
    ROOFTOP: 1,
    RANGE_INTERPOLATED: 0.9,
    GEOMETRIC_CENTER: 0.7,
    APPROXIMATE: 0.5
  };

  var extractedObj = {
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

  for (var i = 0; i < result.address_components.length; i++) {
    for (var x = 0; x < result.address_components[i].types.length; x++) {
      var addressType = result.address_components[i].types[x];
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
};

/**
 * Reverse geocoding
 * @param {lat:<number>,lon:<number>}  lat: Latitude, lon: Longitude
 * @param <function> callback Callback method
 */
GoogleGeocoder.prototype._reverse = function (query: any, callback: any) {
  var lat = query.lat;
  var lng = query.lon;

  var _this = this;
  var params = this._prepareQueryString();

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
  this.httpAdapter.get(this._endpoint, params, function (err: any, result: any) {
    if (err) {
      return callback(err);
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
          { raw: result }
        );
      }

      var results = [];

      if (result.results.length > 0) {
        results.push(_this._formatResult(result.results[0]));
      }

      // @ts-expect-error TS(2339): Property 'raw' does not exist on type 'any[]'.
      results.raw = result;
      callback(false, results);
    }
  });
};

GoogleGeocoder.prototype._encodeSpecialChars = function (value: any) {
  if (typeof value === 'string') {
    return value.replace(/\u001a/g, ' ');
  }

  return value;
};

export default GoogleGeocoder;
