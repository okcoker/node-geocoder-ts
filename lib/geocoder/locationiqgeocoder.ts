var
  querystring      = require('querystring'),
  util             = require('util'),
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'AbstractGe... Remove this comment to see the full error message
  AbstractGeocoder = require('./abstractgeocoder');

/**
 * Constructor
 *
 * Geocoder for LocationIQ
 * http://locationiq.org/#docs
 *
 * @param {[type]} httpAdapter [description]
 * @param {String} apiKey      [description]
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'LocationIQ... Remove this comment to see the full error message
var LocationIQGeocoder = function LocationIQGeocoder(this: any, httpAdapter: any, apiKey: any) {

  // @ts-expect-error TS(2339): Property 'super_' does not exist on type '(this: a... Remove this comment to see the full error message
  LocationIQGeocoder.super_.call(this, httpAdapter);

  if (!apiKey || apiKey == 'undefined') {
    throw new Error('LocationIQGeocoder needs an apiKey');
  }

  this.apiKey = querystring.unescape(apiKey);
};

util.inherits(LocationIQGeocoder, AbstractGeocoder);

LocationIQGeocoder.prototype._endpoint = 'http://us1.locationiq.com/v1';

/**
 * Geocode
 * @param  {string|object}   value
 *   Value to geocode (Adress String or parameters as specified over at
 *   http://locationiq.org/#docs)
 * @param  {Function} callback callback method
 */
LocationIQGeocoder.prototype._geocode = function(value: any, callback: any) {
  var params = this._getCommonParams();

  if (typeof value === 'string') {
    params.q = value;
  } else {
    for (var k in value) {
      var v = value[k];
      switch(k) {
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
  this._forceParams(params);

  this.httpAdapter.get(this._endpoint + '/search', params,
    function(this: any, err: any, responseData: any) {
      if (err) {
        return callback(err);
      }

      // when there’s no err thrown here the resulting array object always
      // seemes to be defined but empty so no need to check for
      // responseData.error for now
      // add check if the array is not empty, as it returns an empty array from time to time
      var results = [];
      if (responseData.length && responseData.length > 0) {
        results = responseData.map(this._formatResult).filter(function(result: any) {
          return result.longitude && result.latitude;
        });
        results.raw = responseData;
      }

      callback(false, results);
    }.bind(this));
};

/**
 * Reverse geocoding
 * @param  {lat:<number>,lon<number>}   query    lat: Latitude, lon: Longitutde and additional parameters as specified here: http://locationiq.org/#docs
 * @param  {Function} callback Callback method
 */
LocationIQGeocoder.prototype._reverse = function(query: any, callback: any) {
  var params = this._getCommonParams();

  for (var k in query) {
    var v = query[k];
    params[k] = v;
  }
  this._forceParams(params);

  this.httpAdapter.get(this._endpoint + '/reverse', params,
    function(this: any, err: any, responseData: any) {
      if (err) {
        return callback(err);
      }

      // when there’s no err thrown here the resulting array object always
      // seemes to be defined but empty so no need to check for
      // responseData.error for now

      // locationiq always seemes to answer with a single object instead
      // of an array
      var results = [responseData].map(this._formatResult).filter(function(result) {
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        return result.longitude && result.latitude;
      });
      // @ts-expect-error TS(2339): Property 'raw' does not exist on type 'unknown[]'.
      results.raw = responseData;

      callback(false, results);
    }.bind(this));
};

LocationIQGeocoder.prototype._formatResult = function(result: any) {
  // transform lat and lon to real floats
  var transformedResult = {
    'latitude' : result.lat ? parseFloat(result.lat) : undefined,
    'longitude' : result.lon ? parseFloat(result.lon) : undefined
  };

  if (result.address) {
    // @ts-expect-error TS(2339): Property 'country' does not exist on type '{ latit... Remove this comment to see the full error message
    transformedResult.country = result.address.country;
    // @ts-expect-error TS(2339): Property 'country' does not exist on type '{ latit... Remove this comment to see the full error message
    transformedResult.country = result.address.country;
    // @ts-expect-error TS(2339): Property 'city' does not exist on type '{ latitude... Remove this comment to see the full error message
    transformedResult.city = result.address.city || result.address.town || result.address.village || result.address.hamlet;
    // @ts-expect-error TS(2339): Property 'state' does not exist on type '{ latitud... Remove this comment to see the full error message
    transformedResult.state = result.address.state;
    // @ts-expect-error TS(2339): Property 'zipcode' does not exist on type '{ latit... Remove this comment to see the full error message
    transformedResult.zipcode = result.address.postcode;
    // @ts-expect-error TS(2339): Property 'streetName' does not exist on type '{ la... Remove this comment to see the full error message
    transformedResult.streetName = result.address.road || result.address.cycleway;
    // @ts-expect-error TS(2339): Property 'streetNumber' does not exist on type '{ ... Remove this comment to see the full error message
    transformedResult.streetNumber = result.address.house_number;

    // make sure countrycode is always uppercase to keep node-geocoder api formats
    var countryCode = result.address.country_code;
    if (countryCode) {
        countryCode = countryCode.toUpperCase();
    }

    // @ts-expect-error TS(2339): Property 'countryCode' does not exist on type '{ l... Remove this comment to see the full error message
    transformedResult.countryCode = countryCode;
  }
  return transformedResult;
};

/**
* Prepare common params
*
* @return <Object> common params
*/
LocationIQGeocoder.prototype._getCommonParams = function() {
  return {
    'key': this.apiKey
  };
};

/**
 * Adds parameters that are enforced
 *
 * @param  {object} params object containing the parameters
 */
LocationIQGeocoder.prototype._forceParams = function(params: any) {
  params.format = 'json';
  params.addressdetails = '1';
};


export default LocationIQGeocoder;
