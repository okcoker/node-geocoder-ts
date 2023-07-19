var util             = require('util'),
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'AbstractGe... Remove this comment to see the full error message
    AbstractGeocoder = require('./abstractgeocoder');

/**
 * SmartyStreets Constructor
 * @param <object> httpAdapter Http Adapter
 * @param <object> options     Options
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'SmartyStre... Remove this comment to see the full error message
var SmartyStreets = function SmartyStreets(this: any, httpAdapter: any, auth_id: any, auth_token: any) {
    // @ts-expect-error TS(2339): Property 'super_' does not exist on type '(this: a... Remove this comment to see the full error message
    SmartyStreets.super_.call(this, httpAdapter);

    if(!auth_id && !auth_token){
      throw new Error('You must specify an auth-id and auth-token!');
    }

    this.auth_id = auth_id;
    this.auth_token = auth_token;
};

util.inherits(SmartyStreets, AbstractGeocoder);

SmartyStreets.prototype._endpoint = 'https://api.smartystreets.com/street-address';

/**
* Reverse geocoding
* @param <integer>  lat      Latittude
* @param <integer>  lng      Longitude
* @param <function> callback Callback method
*/
SmartyStreets.prototype.reverse = function(lat: any, lng: any, callback: any) {
    if (typeof this._reverse != 'function') {
        throw new Error(this.constructor.name + ' doesnt support reverse geocoding!');
    }

    return this._reverse(lat, lng, callback);
};

/**
 * Format Result
 **/
SmartyStreets.prototype._formatResult = function(result: any) {
  if(result){
      return [{
        'latitude' : result.metadata.latitude,
        'longitude' : result.metadata.longitude,
        'country' : null,
        'city' : result.components.city_name,
        'zipcode' : result.components.zipcode,
        'streetName' : result.components.street_name + ' ' + result.components.street_suffix,
        'streetNumber' : result.components.primary_number,
        'countryCode' : null,
        'type' : result.metadata.record_type,
        'dpv_match' : result.analysis.dpv_match_code,
        'dpv_footnotes' : result.analysis.dpv_footnotes
      }];
  }
};

/**
* Geocode
* @param <string>   value    Value to geocode
* @param <function> callback Callback method
*/
SmartyStreets.prototype.geocode = function(value: any, callback: any) {
    var _this = this;

    var params = {
      'street': value,
      'auth-id': this.auth_id,
      'auth-token': this.auth_token,
      'format': 'json'
    };

    this.httpAdapter.get(this._endpoint,params,function(err: any, result: any){
      if(err) {
        return callback(err);
      } else {
        var results: any = [];

        result.forEach(function(result: any) {
          results.push(_this._formatResult(result));
        });

        results.raw = result;
        callback(false, results);
      }
    });
};

export default SmartyStreets;
