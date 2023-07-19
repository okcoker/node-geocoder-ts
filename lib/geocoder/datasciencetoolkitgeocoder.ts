var util             = require('util'),
    net              = require('net'),
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'AbstractGe... Remove this comment to see the full error message
    AbstractGeocoder = require('./abstractgeocoder');

/**
 * Constructor
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'DataScienc... Remove this comment to see the full error message
var DataScienceToolkitGeocoder = function DataScienceToolkitGeocoder(this: any, httpAdapter: any, options: any) {
    this.options     = ['host'];
    this.supportIPv4 = true;

    // @ts-expect-error TS(2339): Property 'super_' does not exist on type '(this: a... Remove this comment to see the full error message
    DataScienceToolkitGeocoder.super_.call(this, httpAdapter, options);
};

util.inherits(DataScienceToolkitGeocoder, AbstractGeocoder);

/**
* Build DSTK endpoint, allows for local DSTK installs
* @param <string>   value    Value to geocode (Address or IPv4)
*/
DataScienceToolkitGeocoder.prototype._endpoint = function(value: any) {
   var ep = { };
   var host = 'www.datasciencetoolkit.org';

   if(this.options.host) {
        host =  this.options.host;
    }

    // @ts-expect-error TS(2339): Property 'ipv4Endpoint' does not exist on type '{}... Remove this comment to see the full error message
    ep.ipv4Endpoint = 'http://' + host + '/ip2coordinates/';
    // @ts-expect-error TS(2339): Property 'street2coordinatesEndpoint' does not exi... Remove this comment to see the full error message
    ep.street2coordinatesEndpoint = 'http://' + host + '/street2coordinates/';

    // @ts-expect-error TS(2339): Property 'ipv4Endpoint' does not exist on type '{}... Remove this comment to see the full error message
    return net.isIPv4(value) ? ep.ipv4Endpoint : ep.street2coordinatesEndpoint;
};

/**
* Geocode
* @param <string>   value    Value to geocode (Address or IPv4)
* @param <function> callback Callback method
*/
DataScienceToolkitGeocoder.prototype._geocode = function(value: any, callback: any) {

    var ep = this._endpoint(value);
    this.httpAdapter.get(ep + value , { }, function(err: any, result: any) {
        if (err) {
            return callback(err);
        } else {
            result = result[value];
            if (!result) {
                return callback(new Error('Could not geocode "' + value + '".'));
            }

            var results = [];

            results.push({
                'latitude' : result.latitude,
                'longitude' : result.longitude,
                'country' : result.country_name,
                'city' : result.city || result.locality,
                'state' : result.state || result.region,
                'zipcode' : result.postal_code,
                'streetName': result.street_name,
                'streetNumber' : result.street_number,
                'countryCode' : result.country_code
            });

            // @ts-expect-error TS(2339): Property 'raw' does not exist on type '{ latitude:... Remove this comment to see the full error message
            results.raw = result;
            callback(false, results);
        }

    });

};

export default DataScienceToolkitGeocoder;
