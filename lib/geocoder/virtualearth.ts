var util = require('util');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'AbstractGe... Remove this comment to see the full error message
var AbstractGeocoder = require('./abstractgeocoder');

/**
 * Constructor
 * @param <object> httpAdapter Http Adapter
 * @param <object> options     Options (language, clientId, apiKey)
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'VirtualEar... Remove this comment to see the full error message
var VirtualEarthGeocoder = function VirtualEarthGeocoder(this: any, httpAdapter: any, options: any) {

  // @ts-expect-error TS(2339): Property 'super_' does not exist on type '(this: a... Remove this comment to see the full error message
  VirtualEarthGeocoder.super_.call(this, httpAdapter, options);

  if (!this.options.apiKey || this.options.apiKey == 'undefined') {
    throw new Error('You must specify an apiKey');
  }
};

util.inherits(VirtualEarthGeocoder, AbstractGeocoder);

// TomTom geocoding API endpoint
VirtualEarthGeocoder.prototype._endpoint = 'https://dev.virtualearth.net/REST/v1/Locations';

/**
* Geocode
* @param <string>   value    Value to geocode (Address)
* @param <function> callback Callback method
*/
VirtualEarthGeocoder.prototype._geocode = function(value: any, callback: any) {

  var _this = this;

  var params = {
    q : value,
    key   : this.options.apiKey
  };

  this.httpAdapter.get(this._endpoint, params, function(err: any, result: any) {
    if (err) {
      return callback(err);
    } else {
      var results = [];

      for(var i = 0; i < result.resourceSets[0].resources.length; i++) {
          results.push(_this._formatResult(result.resourceSets[0].resources[i]));
      }

      // @ts-expect-error TS(2339): Property 'raw' does not exist on type 'any[]'.
      results.raw = result;
      callback(false, results);
    }
  });
};

/**
* Reverse geocoding
* @param {lat:<number>, lon:<number>}  lat: Latitude, lon: Longitude
* @param <function> callback Callback method
*/
VirtualEarthGeocoder.prototype._reverse = function(value: any, callback: any) {

  var _this = this;

  var params = {
    key: this.options.apiKey
  };

  var endpoint = this._endpoint + '/' + value.lat + ',' + value.lon;

  this.httpAdapter.get(endpoint, params, function(err: any, result: any) {
    if (err) {
      return callback(err);
    } else {
      var results = [];

      for(var i = 0; i < result.resourceSets[0].resources.length; i++) {
          results.push(_this._formatResult(result.resourceSets[0].resources[i]));
      }

      // @ts-expect-error TS(2339): Property 'raw' does not exist on type 'any[]'.
      results.raw = result;
      callback(false, results);
    }
  });
}

VirtualEarthGeocoder.prototype._formatResult = function(result: any) {
  return {
    'latitude' : result.point.coordinates[0],
    'longitude' : result.point.coordinates[1],
    'country' : result.address.countryRegion,
    'city' : result.address.locality,
    'state' : result.address.adminDistrict,
    'zipcode' : result.address.postalCode,
    'streetName': result.address.addressLine,
    'formattedAddress': result.address.formattedAddress
  };
};

export default VirtualEarthGeocoder;
