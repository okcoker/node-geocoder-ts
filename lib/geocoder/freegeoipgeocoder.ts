var util             = require('util'),
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'AbstractGe... Remove this comment to see the full error message
    AbstractGeocoder = require('./abstractgeocoder');

/**
 * Constructor
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'FreegeoipG... Remove this comment to see the full error message
var FreegeoipGeocoder = function FreegeoipGeocoder(this: any, httpAdapter: any) {
    this.supportIPv4   = true;
    this.supportIPv6   = true;
    this.supportAddress = false;
    // @ts-expect-error TS(2339): Property 'super_' does not exist on type '(this: a... Remove this comment to see the full error message
    FreegeoipGeocoder.super_.call(this, httpAdapter);
};

util.inherits(FreegeoipGeocoder, AbstractGeocoder);

// WS endpoint
FreegeoipGeocoder.prototype._endpoint = 'https://freegeoip.net/json/';

/**
* Geocode
* @param <string>   value    Value to geocode (IP only)
* @param <function> callback Callback method
*/
FreegeoipGeocoder.prototype._geocode = function(value: any, callback: any) {
    this.httpAdapter.get(this._endpoint + value , { }, function(err: any, result: any) {
        if (err) {
            return callback(err);
        } else {

            var results = [];

            results.push({
                'ip' : result.ip,
                'countryCode' : result.country_code,
                'country' : result.country_name,
                'regionCode' : result.region_code,
                'regionName' : result.region_name,
                'city' : result.city,
                'zipcode' : result.zip_code,
                'timeZone' : result.time_zone,
                'latitude' : result.latitude,
                'longitude' : result.longitude,
                'metroCode' : result.metro_code

            });

            // @ts-expect-error TS(2339): Property 'raw' does not exist on type '{ ip: any; ... Remove this comment to see the full error message
            results.raw = result;
            callback(false, results);
        }

    });

};

export default FreegeoipGeocoder;
