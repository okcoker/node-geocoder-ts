var util = require('util');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'AbstractGe... Remove this comment to see the full error message
var AbstractGeocoder = require('./abstractgeocoder');

/**
 * Constructor
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'TeleportGe... Remove this comment to see the full error message
var TeleportGeocoder = function TeleportGeocoder(this: any, httpAdapter: any, options: any) {
  // @ts-expect-error TS(2339): Property 'super_' does not exist on type '(this: a... Remove this comment to see the full error message
  TeleportGeocoder.super_.call(this, httpAdapter, options);

  var base = 'https://api.teleport.org/api';
  this._cities_endpoint = base + '/cities/';
  this._locations_endpoint = base + '/locations/';
};

util.inherits(TeleportGeocoder, AbstractGeocoder);

function getEmbeddedPath(parent: any, path: any) {
  var elements = path.split('/');
  for ( var i in elements) {
    var element = elements[i];
    var embedded = parent._embedded;
    if (!embedded) {
      return undefined;
    }
    var child = embedded[element];
    if (!child) {
      return undefined;
    }
    parent = child;
  }
  return parent;
}

/**
 * Geocode
 *
 * @param <string>    value     Value to geocode (Address)
 * @param <function>  callback  Callback method
 */
TeleportGeocoder.prototype._geocode = function(value: any, callback: any) {
  var _this = this;

  var params = {};
  // @ts-expect-error TS(2339): Property 'search' does not exist on type '{}'.
  params.search = value;
  // @ts-expect-error TS(2339): Property 'embed' does not exist on type '{}'.
  params.embed = 'city:search-results/city:item/{city:country,city:admin1_division,city:urban_area}';

  this.httpAdapter.get(this._cities_endpoint, params, function(err: any, result: any) {
    if (err) {
      return callback(err);
    } else {
      var results = [];

      if (result) {
        var searchResults = getEmbeddedPath(result, 'city:search-results') || [];
        for (var i in searchResults) {
          // @ts-expect-error TS(2363): The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
          var confidence = (25 - i) / 25.0 * 10;
          results.push(_this._formatResult(searchResults[i], 'city:item', confidence));
        }
      }

      // @ts-expect-error TS(2339): Property 'raw' does not exist on type 'any[]'.
      results.raw = result;
      callback(false, results);
    }
  });
};

TeleportGeocoder.prototype._formatResult = function(result: any, cityRelationName: any, confidence: any) {
  var city = getEmbeddedPath(result, cityRelationName);
  var admin1 = getEmbeddedPath(city, 'city:admin1_division') || {};
  var country = getEmbeddedPath(city, 'city:country') || {};
  var urban_area = getEmbeddedPath(city, 'city:urban_area') || {};
  var urban_area_links = urban_area._links || {};
  var extra = {
    confidence: confidence,
    urban_area: urban_area.name,
    urban_area_api_url: (urban_area_links.self || {}).href,
    urban_area_web_url: urban_area.teleport_city_url
  };
  if (result.distance_km) {
    // @ts-expect-error TS(2339): Property 'distance_km' does not exist on type '{ c... Remove this comment to see the full error message
    extra.distance_km = result.distance_km;
  }
  if (result.matching_full_name) {
    // @ts-expect-error TS(2339): Property 'matching_full_name' does not exist on ty... Remove this comment to see the full error message
    extra.matching_full_name = result.matching_full_name;
  }

  return {
    'latitude': city.location.latlon.latitude,
    'longitude': city.location.latlon.longitude,
    'city': city.name,
    'country': country.name,
    'countryCode': country.iso_alpha2,
    'state': admin1.name,
    'stateCode': admin1.geonames_admin1_code,
    'extra': extra
  };
};

/**
 * Reverse geocoding
 *
 * @param {lat:<number>,lon:<number>}  lat: Latitude, lon: Longitude
 * @param <function> callback          Callback method
 */
TeleportGeocoder.prototype._reverse = function(query: any, callback: any) {
  var lat = query.lat;
  var lng = query.lon;
  var suffix = lat + ',' + lng;

  var _this = this;

  var params = {};
  // @ts-expect-error TS(2339): Property 'embed' does not exist on type '{}'.
  params.embed = 'location:nearest-cities/location:nearest-city/{city:country,city:admin1_division,city:urban_area}';

  this.httpAdapter.get(this._locations_endpoint + suffix, params, function(err: any, result: any) {
    if (err) {
      throw err;
    } else {
      var results = [];

      if (result) {
        var searchResults = getEmbeddedPath(result, 'location:nearest-cities') || [];
        for ( var i in searchResults) {
          var searchResult = searchResults[i];
          var confidence = Math.max(0, 25 - searchResult.distance_km) / 25 * 10;
          results.push(_this._formatResult(searchResult, 'location:nearest-city', confidence));
        }
      }

      // @ts-expect-error TS(2339): Property 'raw' does not exist on type 'any[]'.
      results.raw = result;
      callback(false, results);
    }
  });
};

export default TeleportGeocoder;
