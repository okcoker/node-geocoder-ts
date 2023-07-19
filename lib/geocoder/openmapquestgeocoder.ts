var querystring = require('querystring'),
  util = require('util'),
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'AbstractGe... Remove this comment to see the full error message
  AbstractGeocoder = require('./abstractgeocoder');

/**
 * Constructor
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'MapQuestGe... Remove this comment to see the full error message
var MapQuestGeocoder = function OpenMapQuestGeocoder(this: any, httpAdapter: any, apiKey: any) {

  MapQuestGeocoder.super_.call(this, httpAdapter);

  if (!apiKey || apiKey == 'undefined') {

    throw new Error(this.constructor.name + ' needs an apiKey');
  }

  this.apiKey = apiKey;
  this._endpoint = 'https://open.mapquestapi.com/geocoding/v1';
};

util.inherits(MapQuestGeocoder, AbstractGeocoder);

/**
 * Geocode
 * @param <string>   value    Value to geocode (Address)
 * @param <function> callback Callback method
 */
MapQuestGeocoder.prototype._geocode = function (value: any, callback: any) {
  var _this = this;
  this.httpAdapter.get(this._endpoint + '/address', {
    'location': value,
    'key': querystring.unescape(this.apiKey)
  }, function (err: any, result: any) {
    if (err) {
      return callback(err);
    } else {
      if (result.info.statuscode !== 0) {
        return callback(new Error('Status is ' + result.info.statuscode + ' ' + result.info.messages[0]), {raw: result});
      }

      var results = [];

      var locations = result.results[0].locations;

      for (var i = 0; i < locations.length; i++) {
        results.push(_this._formatResult(locations[i]));
      }

      // @ts-expect-error TS(2339): Property 'raw' does not exist on type 'any[]'.
      results.raw = result;
      callback(false, results);
    }
  });
};

MapQuestGeocoder.prototype._formatResult = function (result: any) {
  var MQConfidenceLookup = {
    POINT: 1,
    ADDRESS: 0.9,
    INTERSECTION: 0.8, //less accurate than the MQ description
    STREET: 0.7,
    ZIP: 0.5,
    ZIP_EXTENDED: 0.5,
    NEIGHBORHOOD: 0.5,
    CITY: 0.4,
    COUNTY: 0.3,
    STATE: 0.2,
    COUNTRY: 0.1
  };
  return {
    'latitude': result.latLng.lat,
    'longitude': result.latLng.lng,
    'country': null,
    'countryCode': result.adminArea1,
    'city': result.adminArea5,
    'state': result.adminArea3,
    'zipcode': result.postalCode,
    'streetName': result.street,
    'streetNumber': null,
    'extra': {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      confidence: MQConfidenceLookup[result.geocodeQuality] || 0
    }

  };
};

/**
 * Reverse geocoding
 * @param {lat:<number>,lon:<number>}  lat: Latitude, lon: Longitude
 * @param <function> callback Callback method
 */
MapQuestGeocoder.prototype._reverse = function (query: any, callback: any) {
  var lat = query.lat;
  var lng = query.lon;

  var _this = this;

  this.httpAdapter.get(this._endpoint + '/reverse', {
    'location': lat + ',' + lng,
    'key': querystring.unescape(this.apiKey)
  }, function (err: any, result: any) {
    if (err) {
      return callback(err);
    } else {
      var results = [];
      var locations;

      if (result.results === undefined || !result.results.length) {
          return callback(new Error('Incorrect response'));
      }

      locations = result.results[0].locations;

      for (var i = 0; i < locations.length; i++) {
        results.push(_this._formatResult(locations[i]));
      }

      // @ts-expect-error TS(2339): Property 'raw' does not exist on type 'any[]'.
      results.raw = result;
      callback(false, results);
    }
  });
};

export default MapQuestGeocoder;
