
var net = require('net');
// @ts-expect-error TS(2403): Subsequent variable declarations must have the sam... Remove this comment to see the full error message
var ValueError = require('../error/valueerror.js');

function formatGeocoderName(name: any) {
  return name.toLowerCase().replace(/geocoder$/, '');
}

/**
 * AbstractGeocoder Constructor
 * @param <object> httpAdapter Http Adapter
 * @param <object> options     Options
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'AbstractGe... Remove this comment to see the full error message
var AbstractGeocoder = function(this: any, httpAdapter: any, options: any) {
  if (!this.constructor.name) {
    throw new Error('The Constructor must be named');
  }

  this.name = formatGeocoderName(this.constructor.name);

  if (!httpAdapter || httpAdapter == 'undefined') {
    throw new Error(this.constructor.name + ' need an httpAdapter');
  }
  this.httpAdapter = httpAdapter;

  if (!options || options == 'undefined') {
    options = {};
  }

  if (this.options) {
    this.options.forEach(function(option: any) {
      if (!options[option] || options[option] == 'undefined') {
        options[option] = null;
      }
    });
  }

  this.options = options;
};

/**
 * Reverse geocoding
 * @param {lat:<number>,lon:<number>}  lat: Latitude, lon: Longitude
 * @param <function> callback Callback method
 */
AbstractGeocoder.prototype.reverse = function(query: any, callback: any) {
  if (typeof this._reverse != 'function') {
    throw new Error(this.constructor.name + ' no support reverse geocoding');
  }

  return this._reverse(query, callback);
};

/**
 * Geocode
 * @param <string>   value    Value to geocode
 * @param <function> callback Callback method
 */
AbstractGeocoder.prototype.geocode = function(value: any, callback: any) {
  var address = value;
  if (typeof value === 'object') {
    address = value.address;
  }
  if (typeof this._geocode != 'function') {
    // @ts-expect-error TS(7009): 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    throw new ValueError(this.constructor.name + ' does not support geocoding');
  }
  if (
    net.isIPv4(address) &&
    (!this.supportIPv4 || this.supportIPv4 == 'undefined')
  ) {
    // @ts-expect-error TS(7009): 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    throw new ValueError(
      this.constructor.name + ' does not support geocoding IPv4'
    );
  }

  if (
    net.isIPv6(address) &&
    (!this.supportIPv6 || this.supportIPv6 == 'undefined')
  ) {
    // @ts-expect-error TS(7009): 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    throw new ValueError(
      this.constructor.name + ' does not support geocoding IPv6'
    );
  }

  if (
    this.supportAddress === false &&
    !net.isIPv4(address) && !net.isIPv6(address)
  ) {
    // @ts-expect-error TS(7009): 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    throw new ValueError(
      this.constructor.name + ' does not support geocoding address'
    );
  }

  return this._geocode(value, callback);
};

/**
 * Batch Geocode
 * @param <string[]>   values    Valueas to geocode
 * @param <function> callback Callback method
 */
 AbstractGeocoder.prototype.batchGeocode = function(values: any, callback: any) {
  if (typeof this._batchGeocode === 'function') {
    this._batchGeocode(values, callback);
  } else {
    Promise.all(
      values.map((value: any) => new Promise(resolve => {
        this.geocode(value, (error: any, value: any) => {
          resolve({
            error,
            value
          });
        });
      })
      )
    )
      .then(data => callback(null, data));
  }
};

export default AbstractGeocoder;
