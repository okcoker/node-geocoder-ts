
var util = require('util');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'AbstractGe... Remove this comment to see the full error message
var AbstractGeocoder = require('./abstractgeocoder');

/**
 * Constructor
 * @param <object> httpAdapter Http Adapter
 * @param <object> options     Options (language, clientId, apiKey)
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'YandexGeoc... Remove this comment to see the full error message
var YandexGeocoder = function YandexGeocoder(this: any, httpAdapter: any, options: any) {
  this.options = ['apiKey'];
  // @ts-expect-error TS(2339): Property 'super_' does not exist on type '(this: a... Remove this comment to see the full error message
  YandexGeocoder.super_.call(this, httpAdapter, options);
};

util.inherits(YandexGeocoder, AbstractGeocoder);

function _findKey(result: any, wantedKey: any) {
  var val = null;
  Object.keys(result).every(function(key) {

  if (key === wantedKey) {
    val = result[key];
    return false;
  }

  if (typeof result[key] === 'object') {
    val = _findKey(result[key], wantedKey);

    return val === null ? true : false;
  }

  return true;
  });

  return val;
}

function _formatResult(result: any) {
  var position = result.GeoObject.Point.pos.split(' ');
  result = result.GeoObject.metaDataProperty.GeocoderMetaData.AddressDetails;

  return {
    'latitude' : parseFloat(position[1]),
    'longitude' : parseFloat(position[0]),
    'city' : _findKey(result, 'LocalityName'),
    'state' : _findKey(result, 'AdministrativeAreaName'),
    'streetName': _findKey(result, 'ThoroughfareName'),
    'streetNumber' : _findKey(result, 'PremiseNumber'),
    'countryCode' : _findKey(result, 'CountryNameCode'),
    'country' : _findKey(result, 'CountryName'),
    'formattedAddress' : _findKey(result, 'AddressLine')
  };
}

function _processOptionsToParams(params: any, options: any){

  //language (language_region, ex: `ru_RU`, `uk_UA`)
  if (options.language) {
    params.lang = options.language;
  }

  //results count (default 10)
  if (options.results) {
    params.results = options.results;
  }

  //skip count (default 0)
  if (options.skip) {
    params.skip = options.skip;
  }

  //Type of toponym (only for reverse geocoding)
  //could be `house`, `street`, `metro`, `district`, `locality`
  if (options.kind) {
    params.kind = options.kind;
  }

  //BBox (ex: `[[lat: 1.0, lng:2.0],[lat: 1.1, lng:2.2]]`)
  if (options.bbox) {
    if (options.bbox.length === 2){
      params.bbox = options.bbox[0].lng + ',' + options.bbox[0].lat;
      params.bbox = params.bbox + '~';
      params.bbox = params.bbox + options.bbox[1].lng + ',' + options.bbox[1].lat;
    }
  }

  //Limit search in bbox (1) or not limit (0)
  if (options.rspn) {
    params.rspn = options.rspn;
  }

  if(options.apiKey) {
    params.apikey = options.apiKey;
  }
}

// Yandex geocoding API endpoint
YandexGeocoder.prototype._endpoint = 'https://geocode-maps.yandex.ru/1.x/';

/**
* Geocode
* @param <string>   value    Value to geocode (Address)
* @param <function> callback Callback method
*/
YandexGeocoder.prototype._geocode = function(value: any, callback: any) {
  var params = {
    geocode : value,
    format: 'json'
  };

  _processOptionsToParams(params, this.options);

  this.httpAdapter.get(this._endpoint, params, function(err: any, result: any) {
    if (err) {
      return callback(err);
    } else {
      var results: any = [];

      result.response.GeoObjectCollection.featureMember.forEach(function(geopoint: any) {
        results.push(_formatResult(geopoint));
      });

      results.raw = result;
      callback(false, results);
    }
  });
};

/**
 * Reverse geocoding
 * @param {lat:<number>,lon:<number>}  lat: Latitude, lon: Longitude
 * @param <function> callback Callback method
 */
YandexGeocoder.prototype._reverse = function (query: any, callback: any) {
  var lat = query.lat;
  var lng = query.lon;

  var value = lng + ',' + lat;

  this._geocode(value, callback);
};


export default YandexGeocoder;
