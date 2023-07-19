var querystring      = require('querystring'),
    util             = require('util'),
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'AbstractGe... Remove this comment to see the full error message
    AbstractGeocoder = require('./abstractgeocoder');

/**
 * Constructor
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'MapQuestGe... Remove this comment to see the full error message
var MapQuestGeocoder = function MapQuestGeocoder(this: any, httpAdapter: any, apiKey: any) {

  // @ts-expect-error TS(2339): Property 'super_' does not exist on type '(this: a... Remove this comment to see the full error message
  MapQuestGeocoder.super_.call(this, httpAdapter);

  if (!apiKey || apiKey == 'undefined') {

    throw new Error('MapQuestGeocoder needs an apiKey');
  }

  this.apiKey = apiKey;
};

util.inherits(MapQuestGeocoder, AbstractGeocoder);

MapQuestGeocoder.prototype._endpoint = 'https://www.mapquestapi.com/geocoding/v1';

/**
* Geocode
* @param <string>   value    Value to geocode (Address)
* @param <function> callback Callback method
*/
MapQuestGeocoder.prototype._geocode = function(value: any, callback: any) {
  var params = {'key' : querystring.unescape(this.apiKey)};
  if (typeof value === 'object') {
    if (value.address) {
      // @ts-expect-error TS(2339): Property 'street' does not exist on type '{ key: a... Remove this comment to see the full error message
      params.street = value.address;
    }
    if (value.country) {
      // @ts-expect-error TS(2339): Property 'country' does not exist on type '{ key: ... Remove this comment to see the full error message
      params.country = value.country;
    }
    if (value.zipcode) {
      // @ts-expect-error TS(2339): Property 'postalCode' does not exist on type '{ ke... Remove this comment to see the full error message
      params.postalCode = value.zipcode;
    }
    if (value.city) {
      // @ts-expect-error TS(2339): Property 'city' does not exist on type '{ key: any... Remove this comment to see the full error message
      params.city = value.city;
    }
  } else {
    // @ts-expect-error TS(2339): Property 'location' does not exist on type '{ key:... Remove this comment to see the full error message
    params.location = value;
  }

  var _this = this;
  this.httpAdapter.get(this._endpoint + '/address' , params, function(err: any, result: any) {
    if (err) {
        return callback(err);
    } else {
      if (result.info.statuscode !== 0) {
        return callback(new Error('Status is ' + result.info.statuscode + ' ' + result.info.messages[0]),{raw:result});
      }

      var results = [];
      if (result.results && result.results.length) {
        var locations = result.results[0].locations;

        for(var i = 0; i < locations.length; i++) {
          results.push(_this._formatResult(locations[i]));
        }
      }

      // @ts-expect-error TS(2339): Property 'raw' does not exist on type 'any[]'.
      results.raw = result;

      callback(false, results);
    }
  });
};

MapQuestGeocoder.prototype._formatResult = function(result: any) {
  return {
    formattedAddress: [result.street, result.adminArea5, (result.adminArea3 + ' ' + result.postalCode).trim(), result.adminArea1].join(', '),
    'latitude' : result.latLng.lat,
    'longitude' : result.latLng.lng,
    'country' : null,
    'city' : result.adminArea5,
    'stateCode' : result.adminArea3,
    'zipcode' : result.postalCode,
    'streetName': result.street,
    'streetNumber' : null,
    'countryCode' : result.adminArea1
  };
};

/**
* Reverse geocoding
* @param {lat:<number>,lon:<number>}  lat: Latitude, lon: Longitude
* @param <function> callback Callback method
*/
MapQuestGeocoder.prototype._reverse = function(query: any, callback: any) {
  var lat = query.lat;
  var lng = query.lon;

  var _this = this;

  this.httpAdapter.get(this._endpoint + '/reverse' , { 'location' : lat + ',' + lng, 'key' : querystring.unescape(this.apiKey)}, function(err: any, result: any) {
    if (err) {
      return callback(err);
    } else {
      var results = [];

      var locations = result.results[0].locations;

      for(var i = 0; i < locations.length; i++) {
        results.push(_this._formatResult(locations[i]));
      }

      // @ts-expect-error TS(2339): Property 'raw' does not exist on type 'any[]'.
      results.raw = result;
      callback(false, results);
    }
  });
};

export default MapQuestGeocoder;
